"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface RangeSliderProps {
  id?: string;
  name: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  // Valor que representa "sem limite": nesse valor o campo não é incluído no submit do form,
  // então o filtro correspondente fica ausente — equivalente a não ter informado nada.
  unlimitedValue?: number;
  unlimitedLabel?: string;
  // Sufixo exibido junto ao valor atual (ex.: "km"). Uma string simples em vez de uma função de
  // formatação, já que este é um Client Component recebido de uma Server Component — funções não
  // podem atravessar essa fronteira como prop.
  unit?: string;
  className?: string;
}

export function RangeSlider({
  id,
  name,
  min,
  max,
  step = 1,
  defaultValue = max,
  unlimitedValue = max,
  unlimitedLabel = "Sem limite",
  unit = "",
  className,
}: RangeSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const isUnlimited = value === unlimitedValue;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        id={id}
        {...(isUnlimited ? {} : { name })}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="h-2 w-32 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
      />
      {/* Largura fixa: o texto alterna entre "Sem limite" e "NNN km" (tamanhos bem diferentes) —
          sem isso, a mudança de largura do texto empurra o slider horizontalmente a cada arraste. */}
      <span className="w-24 shrink-0 text-sm text-neutral-600">
        {isUnlimited ? unlimitedLabel : `${value}${unit}`}
      </span>
    </div>
  );
}
