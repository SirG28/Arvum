import Link from "next/link";
import type { User } from "@prisma/client";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { VerifiedPartnerBadge } from "@/components/shared/VerifiedPartnerBadge";
import { Button } from "@/components/ui/Button";
import { PencilIcon } from "@/components/ui/PencilIcon";

interface ProfileViewProps {
  user: Pick<User, "name" | "avatarUrl" | "bio" | "createdAt">;
  averageRating: number | null;
  reviewCount: number;
  isVerifiedPartner: boolean;
  editHref?: string;
}

function formatMemberSince(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// Cabeçalho no formato "cartão de vendedor" de marketplace (foto grande, selo, reputação) — a
// mesma visão serve tanto para o dono ver o próprio perfil (com o botão Editar, se editHref for
// informado) quanto, futuramente, para qualquer pessoa ver o perfil público de outro usuário.
export function ProfileView({ user, averageRating, reviewCount, isVerifiedPartner, editHref }: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} name={user.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">{user.name}</h1>
              {isVerifiedPartner && <VerifiedPartnerBadge />}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Na Arvum desde {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        {editHref && (
          <Link href={editHref}>
            <Button variant="secondary">
              <PencilIcon className="h-4 w-4" />
              Editar perfil
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-neutral-700">
        {averageRating !== null ? (
          <>
            <Rating value={averageRating} size="sm" />
            <span>
              {averageRating.toLocaleString("pt-BR")} ({reviewCount}{" "}
              {reviewCount === 1 ? "avaliação recebida" : "avaliações recebidas"})
            </span>
          </>
        ) : (
          <span className="text-neutral-400">Ainda sem avaliações recebidas</span>
        )}
      </div>

      {user.bio && <p className="text-sm whitespace-pre-line text-neutral-700">{user.bio}</p>}
    </div>
  );
}
