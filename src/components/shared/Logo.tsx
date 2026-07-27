type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Marca "Sulco Conectado": três traços ascendentes (linhas de cultivo vistas de cima,
 * também lidas como crescimento) convergindo para um nó (conexão/logística).
 */
export function Logo({ size = 28, showWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="rotate(-20 24 38)">
          <rect x="21.5" y="24" width="5" height="14" rx="2.5" fill="var(--color-primary-500)" />
        </g>
        <g>
          <rect x="21.5" y="18" width="5" height="20" rx="2.5" fill="var(--color-primary-600)" />
        </g>
        <g transform="rotate(20 24 38)">
          <rect x="21.5" y="12" width="5" height="26" rx="2.5" fill="var(--color-primary-700)" />
        </g>
        <circle cx="24" cy="41" r="3.4" fill="var(--color-accent-500)" />
      </svg>
      {showWordmark && (
        <span
          className="text-lg font-semibold tracking-tight text-primary-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          arvum
        </span>
      )}
    </span>
  );
}
