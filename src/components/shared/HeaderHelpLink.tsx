// "Dúvidas" da primeira linha do header (padrão Localiza) — mesmo destino (WhatsApp) e mesma regra
// de "sem número configurado, sem link quebrado" de WhatsAppSupportLink.tsx, mas com o estilo de
// link de texto simples da barra de navegação em vez do botão-círculo usado em telas de produto.
export function HeaderHelpLink() {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER;
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre a Arvum.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
    >
      Dúvidas
    </a>
  );
}
