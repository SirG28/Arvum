type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Marca "Elo": dois pilares (oferta e demanda) ligados por um nó — a Arvum como
 * ponto de encontro do marketplace, não mais uma folha/broto.
 */
export function Logo({ size = 36, showWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="11 15 42 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="block shrink-0"
      >
        <path
          d="M19,25 L29,30 L26,52 Q25,55 22,55 L19,55 Q16,55 15,52 Z"
          fill="var(--color-primary-700)"
        />
        <path
          d="M45,25 L35,30 L38,52 Q39,55 42,55 L45,55 Q48,55 49,52 Z"
          fill="var(--color-primary-500)"
        />
        <circle cx="32" cy="28" r="8.5" fill="var(--color-accent-500)" />
      </svg>
      {showWordmark && (
        <span
          className="leading-none whitespace-nowrap text-xl font-bold tracking-tight text-primary-800"
          style={{ fontFamily: "var(--font-display)" }}
        >
          arvum
        </span>
      )}
    </span>
  );
}
