const VALUE_PROPS = [
  {
    title: "Acesso",
    description:
      "Produtores encontram e alugam máquinas agrícolas próximas, sem depender de empréstimos informais.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="6" cy="7" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
        <path d="M8.2 8.6 15.8 15.4" />
      </svg>
    ),
  },
  {
    title: "Otimização de recursos",
    description:
      "Proprietários rentabilizam equipamentos ociosos, aumentando o uso de cada máquina cadastrada.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 12a8 8 0 0 1 13.66-5.66" />
        <path d="M20 12a8 8 0 0 1-13.66 5.66" />
        <path d="M17.5 4v3h-3" />
        <path d="M6.5 20v-3h3" />
      </svg>
    ),
  },
  {
    title: "Logística integrada",
    description:
      "Custo de transporte e forma de entrega calculados de ponta a ponta dentro do próprio aluguel.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 18c3-6 5-8 8-8s5 2 8 8" />
        <circle cx="4" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="20" cy="18" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function ValueProps() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-3">
      {VALUE_PROPS.map((item) => (
        <div
          key={item.title}
          className="rounded-lg border border-neutral-200 bg-white p-6 text-left shadow-[var(--shadow-elevation-1)]"
        >
          <div className="mb-3 inline-flex rounded-md bg-primary-50 p-2 text-primary-600">
            {item.icon}
          </div>
          <h2 className="text-sm font-semibold text-neutral-900">{item.title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
