"use client";

import { useRef } from "react";

// Extraído de FeaturedCategories.tsx (primeiro carrossel do projeto) para reaproveitar em
// MachineShelf/HomeMachineCarousel sem duplicar a lógica de navegação.
//
// Mira sempre no início de um cartão vizinho (`children[i].offsetLeft`) em vez de calcular uma
// posição por largura de página — como cada cartão já é um ponto de `scroll-snap-start`, o alvo
// SEMPRE coincide com um ponto de snap real. Isso permite usar `scrollTo({behavior:"smooth"})` sem
// o navegador "corrigir" a rolagem pro ponto de snap mais próximo no meio do caminho (a versão
// anterior evitava esse conflito forçando um salto instantâneo — sem animação nenhuma ao clicar
// nas setas).
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  function scrollByStep(direction: "left" | "right") {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const current = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    // Checagem de borda ANTES de procurar o próximo cartão (não como "efeito colateral" de não
    // achar nenhum): numa posição intermediária, um limiar deslocado por `clientWidth` pode não
    // bater em nenhum cartão real (ex.: perto do fim, sobra menos de uma tela de cartões depois do
    // limiar) — tratar isso como "chegou na ponta" fazia voltar pro início/fim por engano mesmo
    // faltando ir e voltar normalmente pelo meio do carrossel. Só as duas checagens abaixo (bem no
    // início/fim, tolerância de 1px de subpixel) decidem o wrap infinito; qualquer outro caso cai
    // no fallback ao final de cada ramo (maxScroll/0), nunca num wrap pro lado errado.
    let target: number;
    if (direction === "right") {
      if (current >= maxScroll - 1) {
        target = 0;
      } else {
        const threshold = current + el.clientWidth - 1;
        const next = children.find((child) => child.offsetLeft > current + 1 && child.offsetLeft >= threshold);
        target = next ? Math.min(next.offsetLeft, maxScroll) : maxScroll;
      }
    } else {
      if (current <= 1) {
        target = maxScroll;
      } else {
        const threshold = current - el.clientWidth + 1;
        const prev = [...children]
          .reverse()
          .find((child) => child.offsetLeft < current - 1 && child.offsetLeft <= threshold);
        target = prev ? prev.offsetLeft : 0;
      }
    }

    // `prefers-reduced-motion: reduce` já é respeitado globalmente (globals.css zera durações de
    // transição/animação), mas isso não cobre a API imperativa `scrollTo`: o navegador decide
    // sozinho, fora do controle de CSS, como tratar `behavior:"smooth"` quando essa preferência
    // está ativa — em vez de arriscar um comportamento indefinido (de "vira instantâneo" a
    // "não faz nada"), a checagem abaixo decide explicitamente, igual ao restante do projeto.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: prefersReducedMotion ? "instant" : "smooth" });
  }

  return { ref, scrollByStep };
}
