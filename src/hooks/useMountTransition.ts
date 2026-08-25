"use client";

import { useEffect, useRef, useState, type TransitionEvent } from "react";

interface UseMountTransitionResult {
  /** true enquanto o elemento deve continuar no DOM, inclusive durante a transição de saída. */
  rendered: boolean;
  /** controla as classes CSS de entrada/saída — true = estado "visível". */
  visible: boolean;
  /** anexar ao elemento que carrega a transição de `opacity` a ser observada. */
  onTransitionEnd: (event: TransitionEvent<HTMLElement>) => void;
}

// Coordena montagem/desmontagem com uma transição CSS de entrada/saída (Modal, dropdown, drawer,
// toast — MOTION.md). O elemento fica montado (`rendered`) durante toda a saída, para dar tempo
// da transição rodar; só desmonta quando `onTransitionEnd` confirma que a propriedade "opacity"
// terminou de transicionar — nunca no mesmo tick em que `open` vira false.
//
// Tudo num único efeito, sempre reagindo a `open` (nunca a `rendered`): uma versão anterior
// disparava o frame de entrada num efeito separado, dependente de `rendered` — mas se `open`
// virasse `false` e voltasse a `true` antes da transição de saída terminar, `rendered` nunca
// chegava a virar `false`, então aquele efeito nunca rodava de novo e o elemento ficava preso em
// opacity 0 para sempre (fechar e reabrir rápido — duplo clique num menu/drawer/modal — "quebrava"
// a animação). Reagindo só a `open`, reabrir sempre reagenda um novo frame de entrada.
//
// Caso de borda: se `open` virar false antes do frame de entrada sequer rodar (aba em segundo
// plano, fechamento muito rápido), a classe CSS nunca muda de "oculto" para "visível" — logo
// nenhum `transitionend` dispararia. `hasEnteredRef` detecta isso e desmonta direto, em vez de
// esperar por um evento que nunca viria.
export function useMountTransition(open: boolean): UseMountTransitionResult {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      hasEnteredRef.current = false;
      const id = requestAnimationFrame(() => {
        hasEnteredRef.current = true;
        setVisible(true);
      });
      return () => cancelAnimationFrame(id);
    }
    if (!hasEnteredRef.current) {
      setRendered(false);
      return;
    }
    setVisible(false);
  }, [open]);

  function onTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.propertyName === "opacity" && !open) setRendered(false);
  }

  return { rendered, visible, onTransitionEnd };
}
