interface EyeIconProps {
  visible: boolean;
  className?: string;
}

// Mesmo contrato de ícone de estado do HeartIcon.tsx: uma prop booleana controla a forma exibida.
// Olho aberto quando a senha está visível; olho com traço cortando quando está oculta.
export function EyeIcon({ visible, className }: EyeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
    >
      {visible ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3.5 3.5l17 17" />
          <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a15.6 15.6 0 0 1-4.3 4.9" />
          <path d="M6.2 6.9C3.5 8.7 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8" />
          <path d="M9.9 10.1a3 3 0 0 0 4 4" />
        </>
      )}
    </svg>
  );
}
