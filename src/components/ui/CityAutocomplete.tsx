"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { findExactCityMatches, searchCities, type CityOption } from "@/lib/geo/cities";
import { Label } from "./Label";

interface CityAutocompleteProps {
  cityFieldName: string;
  stateFieldName: string;
  label: string;
  placeholder?: string;
  defaultCity?: string;
  defaultState?: string;
  className?: string;
  // Esconde o <Label> visível acima do campo — usado só pela busca do header (HeaderSearchWidget),
  // onde o placeholder já identifica o campo (mesmo padrão da barra de busca da Localiza: "Onde
  // você quer retirar o carro?" dentro do próprio campo, sem rótulo separado acima). O `label`
  // continua obrigatório mesmo assim — vira o aria-label do input pra leitor de tela.
  hideLabel?: boolean;
}

// Combobox de cidade que resolve a UF sozinho: digitando um nome que bate uma única cidade no
// dataset, o estado é preenchido automaticamente; quando o nome existe em mais de uma UF (ex.:
// "Água Boa" em MG e MT), a lista de opções aparece para o usuário escolher — dispensando um
// campo de UF separado no formulário.
export function CityAutocomplete({
  cityFieldName,
  stateFieldName,
  label,
  placeholder = "Ex.: Ribeirão Preto",
  defaultCity,
  defaultState,
  className,
  hideLabel = false,
}: CityAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(defaultCity ?? "");
  const [resolved, setResolved] = useState<CityOption | null>(
    defaultCity && defaultState ? { city: defaultCity, state: defaultState } : null,
  );
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const suggestions = useMemo(() => searchCities(query, 8), [query]);
  // Quando o texto digitado bate o nome de uma única cidade do dataset, a UF é resolvida sozinha;
  // se baterem várias (nomes duplicados entre estados), a lista abaixo mostra as opções.
  const exactMatches = useMemo(() => findExactCityMatches(query), [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: CityOption) {
    setResolved(option);
    setQuery(option.city);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectOption(suggestions[highlightedIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // Entre os nomes que batem mais de uma UF, prioriza esses candidatos no topo da lista — é o
  // caso em que o usuário realmente precisa escolher, então adianta a decisão dele.
  const orderedSuggestions =
    exactMatches.length > 1
      ? [...exactMatches, ...suggestions.filter((option) => !exactMatches.includes(option))]
      : suggestions;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Label htmlFor={inputId} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </Label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          // Resolvido só a partir da digitação do usuário — nunca no mount, senão um valor
          // ambíguo vindo da URL (ex.: "Água Boa" já resolvida para MT) seria apagado aqui, já
          // que o nome sozinho não decide entre os estados possíveis.
          const [onlyMatch, ...rest] = findExactCityMatches(value);
          setResolved(onlyMatch && rest.length === 0 ? onlyMatch : null);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        className={cn(
          "block w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
          hideLabel ? "mt-0" : "mt-1.5",
        )}
      />
      {/* Só envia cidade/UF quando o município foi de fato resolvido (auto ou por seleção) — texto
          livre não reconhecido não é enviado, para não quebrar o cálculo de distância no backend. */}
      <input type="hidden" name={cityFieldName} value={resolved?.city ?? ""} />
      <input type="hidden" name={stateFieldName} value={resolved?.state ?? ""} />
      {(resolved || exactMatches.length > 1) && (
        <p className="mt-1 text-xs text-neutral-500">
          {resolved
            ? `Estado identificado: ${resolved.state}`
            : "Essa cidade existe em mais de um estado — escolha na lista abaixo."}
        </p>
      )}

      {open && orderedSuggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-md"
        >
          {orderedSuggestions.map((option, index) => (
            <li
              key={`${option.city}|${option.state}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectOption(option);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "cursor-pointer px-3 py-1.5",
                index === highlightedIndex ? "bg-primary-50 text-primary-700" : "text-neutral-700",
              )}
            >
              {option.city} — {option.state}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
