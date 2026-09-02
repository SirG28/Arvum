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

// Skeleton por baixo até a imagem terminar de carregar, com um fade-in suave — sem isso, cada
// imagem "pipoca" na tela assim que termina de baixar, e numa conexão lenta isso acontece em
// tempos bem diferentes para cada card do catálogo.
export function LazyImage({ src, alt, className, eager = false }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-base ease-out",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
