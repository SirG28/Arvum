import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrossfadeTransition } from "./useCrossfadeTransition";

describe("useCrossfadeTransition", () => {
  it("faz o crossfade completo quando o valor muda e se estabiliza", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useCrossfadeTransition(value), {
      initialProps: { value: false },
    });

    expect(result.current).toEqual({ displayed: false, visible: true });

    rerender({ value: true });
    expect(result.current.visible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current.displayed).toBe(true);

    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(result.current.visible).toBe(true);

    vi.useRealTimers();
  });

  // Bug real (MOTION.md): um <header> que encolhe ao rolar troca `shrunk` de ida e volta rápido
  // perto do limiar — se o valor voltar ao que já estava exibido antes do fade-out (120ms)
  // terminar, o efeito antigo só reagia a `value` e comparava contra `displayed`, que já batia de
  // novo: retornava cedo sem nunca restaurar `visible`, prendendo o conteúdo em opacity:0 pra
  // sempre (mesma classe de bug já corrigida em useMountTransition.ts para reabrir rápido demais).
  it("não trava em opacity 0 se o valor voltar ao original antes do fade-out terminar", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useCrossfadeTransition(value), {
      initialProps: { value: false },
    });

    rerender({ value: true });
    expect(result.current.visible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    rerender({ value: false });

    expect(result.current.displayed).toBe(false);
    expect(result.current.visible).toBe(true);

    vi.useRealTimers();
  });
});
