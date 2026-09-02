import { Logo } from "@/components/shared/Logo";

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
    <div className="flex w-full flex-col justify-center bg-primary-50 px-10 py-16 lg:px-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10">
        <Logo size={40} />

        <div className="flex flex-col gap-3">
          <h2
            className="text-2xl font-semibold text-neutral-900 lg:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sua máquina parada vira renda. Sua safra não espera.
          </h2>
          <p className="text-sm text-neutral-600">
            A Arvum conecta produtores rurais que precisam de máquinas agrícolas a proprietários
            com equipamentos disponíveis, com logística integrada de ponta a ponta.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {BENEFITS.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-primary-100 p-2 text-primary-600">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
