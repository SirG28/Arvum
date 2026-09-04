const STEPS = [
  {
    title: "Busque a máquina",
    description: "Escolha o tipo de máquina, onde ela vai ser usada e o período que você precisa.",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
  },
  {
    title: "Combine local e período",
    description: "Veja a distância estimada e a disponibilidade de cada máquina antes de decidir.",
    icon: (
      <>
        <path d="M12 3s6 7.2 6 11.2a6 6 0 0 1-12 0C6 10.2 12 3 12 3z" />
      </>
    ),
  },
  {
    title: "Solicite o aluguel",
    description: "Envie o pedido com valores claros de locação, logística e taxas antes de confirmar.",
    icon: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="m8.5 13 2.3 2.3L15.5 11" />
      </>
    ),
  },
  {
    title: "Receba e use",
    description: "Acompanhe o transporte e o andamento do aluguel até a devolução da máquina.",
    icon: (
      <>
        <rect x="2.5" y="9" width="11" height="6" rx="1" />
        <path d="M13.5 11h3.5l3.5 3v1h-7z" />
        <circle cx="7" cy="17.5" r="1.6" />
        <circle cx="16.5" cy="17.5" r="1.6" />
      </>
    ),
  },
];

// Cards de "como funciona" — diferente de ValueProps.tsx (que vende benefício: "por que usar a
// Arvum"), este é o processo em si, numerado, no padrão que os benchmarks (Airbnb/Turo/GetYourGuide)
// usam pra reduzir a fricção de quem chega pela primeira vez.
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2
        className="text-xl font-semibold text-neutral-900"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Como funciona
      </h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[var(--shadow-elevation-1)]"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-primary-600">
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
                  {step.icon}
                </svg>
              </span>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{step.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
