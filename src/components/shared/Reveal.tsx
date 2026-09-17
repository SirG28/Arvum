"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

// Motion de marketing (landing) — ver MOTION.md, Etapa 7. Fora do padrão "montado durante a
// saída" (useMountTransition): aqui o elemento nasce oculto e anima uma única vez ao entrar na
// viewport, sem precisar coordenar desmontagem. `prefers-reduced-motion` já é tratado
// globalmente (globals.css zera a duração da animação), então não há tratamento extra aqui.
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={visible && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
      className={cn(visible ? "animate-fade-up" : "opacity-0", className)}
    >
      {children}
    </div>
  );
}
