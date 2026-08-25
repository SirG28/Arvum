import type { ReactNode } from "react";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.6,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true,
};

// Um ícone por slug de categoria (mesmo estilo line-art dos demais ícones do projeto, sem
// depender de biblioteca externa). Categorias sem entrada aqui caem no ícone genérico.
const ICONS_BY_SLUG: Record<string, ReactNode> = {
  tratores: (
    <svg {...ICON_PROPS}>
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="18" r="2" />
      <path d="M4 17V10a1 1 0 0 1 1-1h4l3 3h4.5a1 1 0 0 1 1 1v3.5" />
      <path d="M9 9V6h2.5" />
    </svg>
  ),
  pulverizadores: (
    <svg {...ICON_PROPS}>
      <path d="M3 8h18" />
      <path d="M6 8v4M12 8v5M18 8v4" />
      <circle cx="6" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  colheitadeiras: (
    <svg {...ICON_PROPS}>
      <path d="M12 21V5" />
      <path d="M12 8c0-2.2-1.8-3.5-4-3.5.3 2.4 1.8 3.7 4 3.5Z" />
      <path d="M12 8c0-2.2 1.8-3.5 4-3.5-.3 2.4-1.8 3.7-4 3.5Z" />
      <path d="M12 13c0-2.2-1.8-3.5-4-3.5.3 2.4 1.8 3.7 4 3.5Z" />
      <path d="M12 13c0-2.2 1.8-3.5 4-3.5-.3 2.4-1.8 3.7-4 3.5Z" />
    </svg>
  ),
  plantadeiras: (
    <svg {...ICON_PROPS}>
      <path d="M12 21v-7" />
      <path d="M12 14c-4.5 0-6.5-2.5-6.5-6.5C10 7.5 12 9.5 12 14Z" />
      <path d="M12 14c4.5 0 6.5-2.5 6.5-6.5C14 7.5 12 9.5 12 14Z" />
      <path d="M4 21h16" />
    </svg>
  ),
  semeadoras: (
    <svg {...ICON_PROPS}>
      <path d="M9 4h6l-1.5 8h-3z" />
      <path d="M12 12v8" />
      <circle cx="5" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="20" r="1" fill="currentColor" stroke="none" />
      <path d="M4 20h16" />
    </svg>
  ),
  arados: (
    <svg {...ICON_PROPS}>
      <path d="M5 19l7-11 3 2-6 10z" />
      <path d="M12 8l6-3" />
      <path d="M3 20h9" />
    </svg>
  ),
  grades: (
    <svg {...ICON_PROPS}>
      <circle cx="5" cy="15" r="3" />
      <circle cx="10.5" cy="10" r="3" />
      <circle cx="16" cy="15" r="3" />
      <circle cx="21" cy="10" r="3" />
    </svg>
  ),
  distribuidores: (
    <svg {...ICON_PROPS}>
      <path d="M12 20v-9" />
      <path d="M12 13c-3-2-6-1.2-8 1.5M12 13c3-2 6-1.2 8 1.5" />
      <circle cx="4.5" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="17" r="1" fill="currentColor" stroke="none" />
      <path d="M9 4h6l1 6h-8z" />
    </svg>
  ),
  implementos: (
    <svg {...ICON_PROPS}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2-2 2.1-2.1a3.98 3.98 0 0 0-3.3-.4z" />
    </svg>
  ),
  "equipamentos-de-irrigacao": (
    <svg {...ICON_PROPS}>
      <path d="M12 3s6 7.2 6 11.2a6 6 0 0 1-12 0C6 10.2 12 3 12 3z" />
    </svg>
  ),
  "transporte-agricola": (
    <svg {...ICON_PROPS}>
      <rect x="2.5" y="9" width="11" height="6" rx="1" />
      <path d="M13.5 11h3.5l3.5 3v1h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </svg>
  ),
  "tecnologia-agricola": (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 13v7" />
      <path d="M8.8 7a4.5 4.5 0 0 1 6.4 0" />
      <path d="M6.5 4.8a8 8 0 0 1 11 0" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg {...ICON_PROPS}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export function CategoryIcon({ slug }: { slug: string }) {
  return <>{ICONS_BY_SLUG[slug] ?? DEFAULT_ICON}</>;
}
