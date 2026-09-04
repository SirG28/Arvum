"use client";

import { useEffect, useState } from "react";

// Dois limiares (não um só): encolhe passado 72px, só volta a expandir abaixo de 32px. Um único
// limiar fazia o header "piscar" (encolher/expandir repetidamente) quando o scroll parava bem em
// cima dele — rolagem de trackpad/mouse raramente para num pixel exato, então qualquer
// microoscilação ali virava um alternar contínuo. A zona morta entre os dois valores absorve essa
// oscilação.
const SHRINK_ENTER_PX = 72;
const SHRINK_EXIT_PX = 32;

// Header encolhe ao rolar (padrão Airbnb/Localiza) em qualquer página que o use, não só a home —
// mesma regra de barra fixa (position: sticky) em toda a navegação, desktop e mobile igual: a
// linha de busca "docada" (HeaderSearchDocked) vive no topo da página; ao rolar, ela dá lugar à
// versão que sobe pra 1ª linha (mesmo componente, só troca de posição no grid do header — ver
// AppHeaderClient/PublicHeaderClient) e os itens "Categorias"/"Dúvidas" saem da primeira linha pra
// abrir espaço. Handler agendado via requestAnimationFrame para não recalcular a cada evento de
// scroll (várias dezenas por segundo), só uma vez por frame pintado.
export function useHeaderScrollState(): boolean {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;

    function handleScroll() {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        setShrunk((current) => {
          if (current) return window.scrollY > SHRINK_EXIT_PX;
          return window.scrollY > SHRINK_ENTER_PX;
        });
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return shrunk;
}
