import { Logo } from "@/components/shared/Logo";

// Mesmo tratamento visual do Hero da home (Context.md §11 "personalidade de marca" — MOTION.md,
// Etapa 7): as duas são a "porta de entrada" da marca, então usam o mesmo gradiente, os mesmos
// brilhos desfocados e a mesma marca-d'água — antes este painel era um verde pálido isolado
// (`bg-primary-50`), uma linguagem visual diferente da home logo na primeira tela que metade dos
// usuários vê (login/cadastro).

const BENEFITS = [
  {
    title: "Conta única",
    description: "Alugue e anuncie máquinas com o mesmo cadastro.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      </svg>
    ),
  },
  {
    title: "Logística integrada",
    description: "Custo e prazo de transporte calculados direto no aluguel.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 18c3-6 5-8 8-8s5 2 8 8" />
        <circle cx="4" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="20" cy="18" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Avaliações reais",
    description: "Veja a nota de proprietários e locatários antes de fechar negócio.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 3.5l2.5 5.2 5.6.8-4 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-4 5.6-.8Z" />
      </svg>
    ),
  },
];

export function AuthBrandPanel() {
  return (
    <div className="relative flex w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-10 py-16 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-accent-500/20 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary-300/15 blur-3xl" />
        <svg
          className="absolute right-[-40px] bottom-[-40px] h-[260px] w-[260px] opacity-[0.14]"
          viewBox="11 15 42 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19,25 L29,30 L26,52 Q25,55 22,55 L19,55 Q16,55 15,52 Z" fill="white" />
          <path d="M45,25 L35,30 L38,52 Q39,55 42,55 L45,55 Q48,55 49,52 Z" fill="white" />
          <circle cx="32" cy="28" r="8.5" fill="var(--color-accent-300)" />
        </svg>
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-10">
        <Logo size={40} variant="light" />

        <div className="flex flex-col gap-3">
          <h2
            className="text-2xl font-semibold text-white lg:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sua máquina parada vira renda. Sua safra não espera.
          </h2>
          <p className="text-sm text-primary-50/90">
            A Arvum conecta produtores rurais que precisam de máquinas agrícolas a proprietários
            com equipamentos disponíveis, com logística integrada de ponta a ponta.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {BENEFITS.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 ring-inset">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-sm text-primary-50/80">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
