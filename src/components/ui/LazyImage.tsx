"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  // Só a imagem já visível ao carregar a página (ex.: foto principal da galeria) deve pular o
  // lazy loading nativo — para as demais, `loading="lazy"` evita baixar imagem nenhuma até o
  // usuário rolar até perto dela, o que pesa mais numa conexão rural instável do que numa banda
  // larga urbana (Arvum Playbook §04).
  eager?: boolean;
}

// As fotos das máquinas (seed) vêm de commons.wikimedia.org/wiki/Special:FilePath/<arquivo> — a
// página wiki de redirecionamento pro arquivo, não uma CDN de imagens; serve o ORIGINAL sem
// redimensionar (algumas com mais de 4000px de largura), e não foi pensada pra hotlinking em
// produção. Medido neste projeto: entre ~240ms e ~1900ms por imagem só localmente — a causa mais
// provável de "algumas demoram muito" relatada. O próprio Special:FilePath aceita `?width=`,
// redirecionando pro thumbnail já redimensionado do Wikimedia em vez do original — 1200px é mais
// que suficiente pro maior uso no app (galeria da máquina) e reduz o arquivo bem abaixo do
// original. Roda em cima de qualquer `src`, não só as do seed: uma URL de outro domínio (owner
// real, no futuro) passa direto, sem efeito.
function withWikimediaThumbnail(url: string, width = 1200): string {
  if (!url.includes("commons.wikimedia.org/wiki/Special:FilePath/") || url.includes("width=")) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
}

// Skeleton por baixo até a imagem terminar de carregar, com um fade-in suave — sem isso, cada
// imagem "pipoca" na tela assim que termina de baixar, e numa conexão lenta isso acontece em
// tempos bem diferentes para cada card do catálogo.
//
// `eager` pula esse esquema inteiro (sempre opacity-100, sem Skeleton por baixo): renderizada no
// HTML do servidor, o navegador começa a baixar essa imagem antes do React hidratar — se ela
// terminar de carregar (cache, resposta rápida) antes do `onLoad` abaixo ser conectado, o evento
// "load" nunca chega no React (dispara uma única vez por elemento) e a imagem ficaria presa atrás
// do skeleton pra sempre. Como `eager` já é reservado pra imagem principal acima da dobra (galeria
// da máquina, Hero), não faz sentido atrasar a exibição dela mesmo — o navegador já pinta assim que
// decodifica, igual a uma <img> comum.
export function LazyImage({ src, alt, className, eager = false }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showSkeleton = !eager && !loaded;

  if (errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-100 text-xs text-neutral-400",
          className,
        )}
      >
        Imagem indisponível
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showSkeleton && <Skeleton className="absolute inset-0 rounded-none" />}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado */}
      <img
        src={withWikimediaThumbnail(src)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-base ease-out",
          eager || loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
