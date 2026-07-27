import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arvum — Aluguel inteligente de máquinas agrícolas",
    short_name: "Arvum",
    description:
      "Plataforma que conecta produtores rurais, máquinas agrícolas ociosas e logística.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#2f7d52",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
