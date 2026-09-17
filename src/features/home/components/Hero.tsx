import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Abertura da home — antes desta seção a página ia direto do header para a grade de máquinas, sem
// nenhuma peça de identidade/intenção da marca.
//
// Decoração de fundo: a própria marca "Elo" (Logo.tsx) ampliada em baixa opacidade, não uma
// ilustração de máquina desenhada à parte — uma silhueta original de trator/maquinário arriscava
// ficar ambígua (lida como "caminhão" genérico) sem uma referência visual real por trás; a marca já
// é reconhecível e existe exatamente pra representar a Arvum. Mesmo path do <svg> de Logo.tsx.
//
// Os dois CTAs usam branco sólido (ação principal) e contorno translúcido (ação secundária) em vez
// de disputar com o verde primário (já é a cor de ação em todo o resto do app) ou usar o terracota
// como preenchimento grande — esse fica reservado só pro brilho decorativo ao fundo.
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent-500/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-primary-300/15 blur-3xl" />
        {/* Ancorada à mesma largura máxima do conteúdo (max-w-5xl), não à borda da seção — em
            telas largas a seção é full-bleed, mas o conteúdo (h1/CTAs) fica bem mais estreito à
            esquerda; ancorar ao container evita a marca ficar solta longe do texto. */}
        <div className="absolute inset-x-0 top-0 bottom-0 mx-auto max-w-5xl px-4">
          <svg
            className="absolute right-0 bottom-[-60px] h-[260px] w-[260px] opacity-[0.16] sm:h-[320px] sm:w-[320px] lg:h-[380px] lg:w-[380px]"
            viewBox="11 15 42 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19,25 L29,30 L26,52 Q25,55 22,55 L19,55 Q16,55 15,52 Z" fill="white" />
            <path d="M45,25 L35,30 L38,52 Q39,55 42,55 L45,55 Q48,55 49,52 Z" fill="white" />
            <circle cx="32" cy="28" r="8.5" fill="var(--color-accent-300)" />
          </svg>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-16 sm:py-20 lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary-50 ring-1 ring-white/20 ring-inset">
          Conectando o campo, uma máquina por vez
        </span>

        <h1
          className="max-w-2xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Máquina parada é produtividade perdida.
        </h1>

        <p className="max-w-xl text-base text-primary-50/90 sm:text-lg">
          A Arvum conecta produtores rurais a máquinas agrícolas disponíveis perto de você — com
          logística, preço e disponibilidade transparentes, do pedido à devolução.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/catalogo">
            <Button className="bg-white text-primary-800 hover:bg-primary-50 focus-visible:ring-white">
              Buscar máquinas
            </Button>
          </Link>
          <Link href="/maquinas/nova">
            <Button
              variant="secondary"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white"
            >
              Anunciar minha máquina
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
