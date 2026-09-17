"use client";

import { useEffect, useRef, useState } from "react";

// Dois limiares (não um só): encolhe passado 72px, só volta a expandir abaixo de 32px. Um único
// limiar fazia o header "piscar" (encolher/expandir repetidamente) quando o scroll parava bem em
// cima dele — rolagem de trackpad/mouse raramente para num pixel exato, então qualquer
// microoscilação ali virava um alternar contínuo. A zona morta entre os dois valores absorve essa
// oscilação.
const SHRINK_ENTER_PX = 72;
const SHRINK_EXIT_PX = 32;

// Distância mínima (não velocidade) desde o último ponto extremo pra contar como "mudou de
// direção" — ver `anchorRef` abaixo. Uma versão anterior comparava contra uma janela de tempo fixa
// (~180ms) pra filtrar o mesmo tipo de solavanco, mas isso deixava a resposta a uma rolagem lenta e
// deliberada pra cima "grudenta" (se o usuário não rolasse rápido o suficiente dentro da janela, a
// busca não voltava) — exatamente o "bugando ao rolar pra cima" relatado. Rastrear o extremo em vez
// do tempo resolve o mesmo problema (um solavanco pontual não passa do limiar sozinho) sem
// depender de velocidade.
const DIRECTION_THRESHOLD_PX = 16;
// Abaixo disso a busca do mobile sempre aparece, mesmo rolando pra baixo — evita esconder o campo
// de busca por causa de um scroll minúsculo logo no topo da página.
const MOBILE_COMPACT_MIN_PX = 96;

interface HeaderScrollState {
  // Encolhe a busca pra 1ª linha (desktop — ver AppHeaderClient/PublicHeaderClient), baseado em
  // POSIÇÃO com histerese: sempre compacto depois de um certo ponto de rolagem, subindo ou
  // descendo, no padrão do header do Airbnb.
  shrunk: boolean;
  // Esconde a busca inteira (mobile), baseado em DIREÇÃO: some ao rolar pra baixo, reaparece assim
  // que o usuário rola pra cima de novo — igual à barra de apps mobile (Instagram, X/Twitter),
  // diferente do critério de posição do desktop.
  mobileCompact: boolean;
}

// Header encolhe ao rolar (padrão Airbnb/Localiza) em qualquer página que o use, não só a home —
// mesma regra de barra fixa (position: sticky) em toda a navegação. Um único listener de scroll
// (agendado via requestAnimationFrame, uma vez por frame pintado) calcula os dois sinais acima
// juntos, em vez de duas assinaturas de scroll separadas para a mesma posição.
export function useHeaderScrollState(): HeaderScrollState {
  const [state, setState] = useState<HeaderScrollState>({ shrunk: false, mobileCompact: false });
  // Ponto extremo do estado atual: enquanto a busca está visível, o Y mais alto (menor) já visto
  // desde a última vez que ela recolheu; enquanto está recolhida, o mais baixo (maior) já visto
  // desde a última vez que apareceu. Comparar contra esse extremo (não contra o frame anterior)
  // absorve um solavanco pontual dentro do mesmo gesto sem precisar de janela de tempo.
  const anchorRef = useRef(0);

  useEffect(() => {
    let frameId: number | null = null;

    function handleScroll() {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const currentY = window.scrollY;

        setState((current) => {
          const shrunk = current.shrunk ? currentY > SHRINK_EXIT_PX : currentY > SHRINK_ENTER_PX;

          let mobileCompact = current.mobileCompact;
          if (currentY <= MOBILE_COMPACT_MIN_PX) {
            mobileCompact = false;
          } else if (!mobileCompact && currentY - anchorRef.current > DIRECTION_THRESHOLD_PX) {
            mobileCompact = true;
          } else if (mobileCompact && anchorRef.current - currentY > DIRECTION_THRESHOLD_PX) {
            mobileCompact = false;
          }

          anchorRef.current =
            currentY <= MOBILE_COMPACT_MIN_PX
              ? currentY
              : mobileCompact
                ? Math.max(anchorRef.current, currentY)
                : Math.min(anchorRef.current, currentY);

          return shrunk === current.shrunk && mobileCompact === current.mobileCompact
            ? current
            : { shrunk, mobileCompact };
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

  return state;
}
