import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/features/authentication/lib/password";
import type { ProfileInput } from "../schemas/profile.schema";
import type { ChangePasswordInput } from "../schemas/change-password.schema";
import type { ChangeEmailRequestInput } from "../schemas/change-email.schema";

// Único lugar que define quais campos do User podem sair para o cliente — nunca passwordHash nem
// pendingEmailToken. Reaproveitado tanto na leitura (getUserById) quanto no retorno da
// atualização, para não vazar segredo nenhum em nenhum dos dois casos (Context.md §19).
const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  documentType: true,
  documentNumber: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
  pendingEmail: true,
} as const;

export type PublicUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>;

export function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
}

// Perfil visível para qualquer visitante (perfil público de outro usuário) — ao contrário de
// PUBLIC_USER_SELECT (que, apesar do nome, é "seguro para devolver ao próprio dono", não para
// terceiros), este nunca inclui e-mail, telefone ou documento. Só contas ativas têm perfil
// público — uma conta desativada não deve ficar navegável por quem tem o link.
const PUBLIC_PROFILE_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

export type PublicUserProfile = NonNullable<Awaited<ReturnType<typeof getPublicUserProfile>>>;

export function getPublicUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, status: "ACTIVE" },
    select: PUBLIC_PROFILE_SELECT,
  });
}

export type UpdateProfileResult = PublicUser | "DOCUMENT_ALREADY_USED";

export async function updateUserProfile(
  userId: string,
  input: ProfileInput,
): Promise<UpdateProfileResult> {
  if (input.documentNumber) {
    const existing = await prisma.user.findUnique({
      where: { documentNumber: input.documentNumber },
      select: { id: true },
    });
    if (existing && existing.id !== userId) return "DOCUMENT_ALREADY_USED";
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone ?? null,
      documentType: input.documentType ?? null,
      documentNumber: input.documentNumber ?? null,
      avatarUrl: input.avatarUrl ?? null,
      bio: input.bio ?? null,
    },
    select: PUBLIC_USER_SELECT,
  });
}

export type ChangePasswordResult = "CHANGED" | "INCORRECT_PASSWORD";

// Exige a senha atual antes de trocar (Context.md §19: gerenciamento seguro de sessões) — nunca
// permite trocar a senha só por já estar logado, sem reconfirmar quem está pedindo a troca.
export async function changeUserPassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return "INCORRECT_PASSWORD";

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) return "INCORRECT_PASSWORD";

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return "CHANGED";
}

const EMAIL_CHANGE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type RequestEmailChangeResult =
  | { pendingEmail: string; token: string }
  | "INCORRECT_PASSWORD"
  | "EMAIL_ALREADY_USED"
  | "SAME_EMAIL";

// Sem provedor de e-mail configurado (mesma limitação documentada para pagamento e geocodificação
// — Context.md §27): o token de confirmação é devolvido direto na resposta em vez de enviado por
// e-mail de verdade, e a interface (ChangeEmailSection.tsx) simula o clique no link. A estrutura
// em si — token com expiração, checagem de e-mail já em uso, exigência de senha atual — é real;
// só o canal de entrega é simulado, para poder virar um envio de verdade sem mudar mais nada
// disso. Exigir a senha atual segue o mesmo padrão de changeUserPassword: nunca trocar um dado
// sensível só por já estar logado, sem reconfirmar quem está pedindo a troca.
export async function requestEmailChange(
  userId: string,
  input: ChangeEmailRequestInput,
): Promise<RequestEmailChangeResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, passwordHash: true },
  });
  if (!user) return "INCORRECT_PASSWORD";

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) return "INCORRECT_PASSWORD";

  if (input.newEmail === user.email) return "SAME_EMAIL";

  const existing = await prisma.user.findUnique({
    where: { email: input.newEmail },
    select: { id: true },
  });
  if (existing) return "EMAIL_ALREADY_USED";

  const token = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: {
      pendingEmail: input.newEmail,
      pendingEmailToken: token,
      pendingEmailExpiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_MS),
    },
  });

  return { pendingEmail: input.newEmail, token };
}

export type ConfirmEmailChangeResult = PublicUser | "INVALID_TOKEN" | "EXPIRED";

export async function confirmEmailChange(
  userId: string,
  token: string,
): Promise<ConfirmEmailChangeResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingEmail: true, pendingEmailToken: true, pendingEmailExpiresAt: true },
  });
  if (!user?.pendingEmailToken || user.pendingEmailToken !== token) return "INVALID_TOKEN";
  if (!user.pendingEmailExpiresAt || user.pendingEmailExpiresAt < new Date()) return "EXPIRED";

  return prisma.user.update({
    where: { id: userId },
    data: {
      email: user.pendingEmail!,
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailExpiresAt: null,
    },
    select: PUBLIC_USER_SELECT,
  });
}

// Desiste da troca pendente (o usuário mudou de ideia, ou pediu para o e-mail errado) — nunca
// mexe no e-mail atual, só limpa o pedido.
export function cancelEmailChange(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { pendingEmail: null, pendingEmailToken: null, pendingEmailExpiresAt: null },
    select: PUBLIC_USER_SELECT,
  });
}

// Desativação (Context.md §8.1/§9.1), não exclusão física: o histórico de reservas, pagamentos e
// avaliações é preservado (§9.1 — "a exclusão da conta não deve destruir o histórico financeiro ou
// de reservas"). auth.ts já recusa login para status != ACTIVE, então isto sozinho já impede o
// acesso à conta.
export async function deactivateUserAccount(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { status: "DEACTIVATED" } });
}

// Campos de Configurações (notificações/privacidade) — separado de PUBLIC_USER_SELECT porque não
// fazem parte da identidade editada em "Meu perfil".
const SETTINGS_USER_SELECT = {
  id: true,
  notifyByEmail: true,
  termsAcceptedAt: true,
  dataDeletionRequestedAt: true,
} as const;

export type UserSettings = NonNullable<Awaited<ReturnType<typeof getUserSettings>>>;

export function getUserSettings(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: SETTINGS_USER_SELECT });
}

export function updateNotificationPreferences(userId: string, notifyByEmail: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { notifyByEmail },
    select: SETTINGS_USER_SELECT,
  });
}

// LGPD — "mecanismo de solicitação de exclusão" (Context.md §19): registra a intenção, não apaga
// nada automaticamente. Parte do histórico (financeiro, reservas) pode precisar ser retida por
// obrigação legal (§9.1), então a exclusão de fato depende de triagem manual — sem painel
// administrativo ainda para isso (Fase 6), o pedido fica registrado esperando essa etapa.
// Idempotente: uma segunda chamada não sobrescreve a data do primeiro pedido.
export async function requestDataDeletion(userId: string): Promise<UserSettings> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { dataDeletionRequestedAt: true },
  });
  if (current?.dataDeletionRequestedAt) {
    return (await getUserSettings(userId)) as UserSettings;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { dataDeletionRequestedAt: new Date() },
    select: SETTINGS_USER_SELECT,
  });
}
