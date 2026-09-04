"use client";

import { useEffect, useRef, useState } from "react";

// Mesmo token de micro-interação do resto do app (--duration-fast, MOTION.md), em ms puro porque
// o valor também vira um setTimeout.
const FADE_OUT_MS = 120;

// Suaviza uma troca de estado que muda a POSIÇÃO de um elemento no grid do header (linha 1 ↔ linha
// 2) — `grid-row`/`grid-column` não são propriedades animáveis em CSS, então uma troca direta de
// classes "pula" instantaneamente mesmo com `transition` declarada.
//
// Coreografia (mesmo padrão de useMountTransition.ts, aplicado a uma troca de valor em vez de
// montagem/desmontagem): `visible` cai pra esmaecer o conteúdo ATUAL; só depois que esse fade-out
// termina (setTimeout = FADE_OUT_MS) o valor exibido troca — ainda invisível nesse frame — e um
// requestAnimationFrame depois `visible` volta a `true`, disparando o fade-in já na nova posição.
// O salto de layout em si acontece nesse meio-tempo, com o elemento em opacity:0 — nunca é visto.
export function useCrossfadeTransition<T>(value: T) {
  const [displayed, setDisplayed] = useState(value);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === displayed) return;

    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setDisplayed(value);
      frameRef.current = requestAnimationFrame(() => setVisible(true));
    }, FADE_OUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // Só reage a `value` de propósito: incluir `displayed` reagendaria o timeout sempre que ele
    // mesmo mudasse (o próprio efeito escreve nele).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { displayed, visible };
}
