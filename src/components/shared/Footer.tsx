import Link from "next/link";
import { Logo } from "./Logo";

const EXPLORE_LINKS = [
  { label: "Catálogo completo", href: "/catalogo" },
  { label: "Tratores", href: "/catalogo?categoria=tratores" },
  { label: "Colheitadeiras", href: "/catalogo?categoria=colheitadeiras" },
  { label: "Irrigação", href: "/catalogo?categoria=equipamentos-de-irrigacao" },
];

const OWNER_LINKS = [
  { label: "Anuncie sua máquina", href: "/maquinas/nova" },
  { label: "Painel do proprietário", href: "/painel-do-proprietario" },
  { label: "Minhas propriedades", href: "/propriedades" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm text-primary-200/80">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Mesma regra de "sem número configurado, sem link quebrado" de HeaderHelpLink.tsx/
// WhatsAppSupportLink.tsx — sem "use client": process.env.NEXT_PUBLIC_* é inlinado no build,
// funciona igual em Server Component.
export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre a Arvum.")}`
    : undefined;

  return (
    <footer className="bg-primary-900">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo size={32} variant="light" />
          <p className="max-w-xs text-sm text-primary-200/80">
            Conectamos produtores rurais a máquinas agrícolas ociosas — com logística, preço e
            disponibilidade transparentes, do pedido à devolução.
          </p>
        </div>

        <FooterColumn title="Explorar" links={EXPLORE_LINKS} />
        <FooterColumn title="Proprietários" links={OWNER_LINKS} />

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">Ajuda</h3>
          <ul className="flex flex-col gap-2 text-sm text-primary-200/80">
            {whatsappHref && (
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Fale conosco (WhatsApp)
                </a>
              </li>
            )}
            <li>
              <Link href="/termos-de-uso" className="transition-colors hover:text-white">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade" className="transition-colors hover:text-white">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-primary-200/60 sm:text-left">
          © {new Date().getFullYear()} Arvum — máquinas agrícolas ociosas, transformadas em
          produtividade.
        </p>
      </div>
    </footer>
  );
}
