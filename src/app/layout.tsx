import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const siteUrl = "https://arvum.dev";
const description =
  "Arvum é a plataforma inteligente que conecta produtores rurais, máquinas agrícolas ociosas e logística — transformando equipamento parado em produtividade.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arvum — Aluguel inteligente de máquinas agrícolas",
    template: "%s — Arvum",
  },
  description,
  applicationName: "Arvum",
  keywords: [
    "Arvum",
    "aluguel de máquinas agrícolas",
    "agtech",
    "agronegócio",
    "logística agrícola",
    "marketplace agro",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Arvum",
    title: "Arvum — Aluguel inteligente de máquinas agrícolas",
    description,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#2f7d52",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body suppressHydrationWarning>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
