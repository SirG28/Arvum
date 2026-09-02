import { cn } from "@/lib/cn";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

interface WhatsAppSupportLinkProps {
  // Mensagem pré-preenchida no WhatsApp — dá contexto pra quem atende sem o usuário precisar
  // digitar de novo o que já estava fazendo na tela.
  message: string;
  label?: string;
  className?: string;
}

// Só renderiza se houver número configurado (NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER) — sem número
// real, nenhum link quebrado aparece na interface. Ponto único de contato humano nos momentos de
// maior fricção (cadastro de máquina, primeira reserva): para o público da Arvum, conversa direta
// resolve dúvida mais rápido que qualquer texto de ajuda na tela (Arvum Playbook §02).
//
// Botão-ícone (só o glifo do WhatsApp, círculo verde da marca) — a legenda é texto normal ao lado,
// nunca dentro do botão, mesmo padrão de rótulo externo do IconButton.tsx (aria-label/title cobrem
// quem usa leitor de tela).
export function WhatsAppSupportLink({
  message,
  label = "Fale com a Arvum no WhatsApp",
  className,
}: WhatsAppSupportLinkProps) {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER;
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white",
          "transition-[background-color,scale] duration-fast ease-out hover:bg-[#1DA851] active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
    </div>
  );
}
