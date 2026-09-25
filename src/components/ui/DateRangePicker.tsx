"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./Label";
import { CalendarIcon } from "./CalendarIcon";

export interface DateRange {
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
}

interface DateRangePickerProps {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  // Menor data selecionável (yyyy-mm-dd) — por padrão, hoje: alugar/filtrar por datas passadas
  // não faz sentido em nenhum dos dois usos deste componente.
  minDate?: string;
  // Períodos já ocupados (bloqueio do proprietário ou aluguel ativo) — aparecem riscados no
  // calendário e não podem ser escolhidos, nem como ponta nem no meio de um intervalo.
  unavailableRanges?: DateRange[];
  error?: string;
  className?: string;
  // Esconde o <Label> visível — mesmo motivo/uso documentado em CityAutocomplete.tsx (busca do
  // header). O trigger já mostra "Selecione o período" como texto até uma data ser escolhida, então
  // a identificação do campo não depende do rótulo externo nesse caso.
  hideLabel?: boolean;
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISO(value: string | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatBR(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Intervalo com fim exclusivo: o dia de devolução já conta como livre de novo, mesmo padrão do
// overlap-check em booking.service.ts (startDate < endDate existente E endDate > startDate novo).
function isDateInRange(date: Date, range: DateRange): boolean {
  const start = fromISO(range.startDate);
  const end = fromISO(range.endDate);
  if (!start || !end) return false;
  return date >= start && date < end;
}

function isDateUnavailable(date: Date, ranges: DateRange[]): boolean {
  return ranges.some((range) => isDateInRange(date, range));
}

// Além da própria data de início/fim (já barradas individualmente), o miolo do intervalo também não
// pode atravessar um período ocupado — senão o usuário fecha uma seleção que a API vai rejeitar.
function rangeHasUnavailableDay(start: Date, end: Date, ranges: DateRange[]): boolean {
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor < end) {
    if (isDateUnavailable(cursor, ranges)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

// Calendário de intervalo em um único campo: primeiro clique define a data inicial, o segundo
// define a final (fecha sozinho); clicar antes da data inicial recomeça a seleção. Usado tanto no
// filtro do catálogo (§ período de disponibilidade) quanto no formulário de aluguel do produto.
export function DateRangePicker({
  label,
  value,
  onChange,
  minDate,
  unavailableRanges = [],
  error,
  className,
  hideLabel = false,
}: DateRangePickerProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const startDateObj = useMemo(() => fromISO(value.startDate), [value.startDate]);
  const endDateObj = useMemo(() => fromISO(value.endDate), [value.endDate]);
  const minDateObj = useMemo(() => fromISO(minDate) ?? startOfToday(), [minDate]);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = startDateObj ?? minDateObj;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = new Date(year, month, 1).getDay();
    const days: (Date | null)[] = [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
    ];
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewMonth]);

  function handleDayClick(date: Date) {
    if (date < minDateObj || isDateUnavailable(date, unavailableRanges)) return;

    if (!startDateObj || endDateObj) {
      onChange({ startDate: toISO(date), endDate: "" });
      return;
    }
    if (date < startDateObj) {
      onChange({ startDate: toISO(date), endDate: "" });
      return;
    }
    if (isSameDay(date, startDateObj)) return;

    if (rangeHasUnavailableDay(startDateObj, date, unavailableRanges)) {
      // O intervalo passaria por um dia já ocupado — em vez de completar uma seleção que a API
      // rejeitaria, trata como se o usuário estivesse recomeçando a partir desta nova data.
      onChange({ startDate: toISO(date), endDate: "" });
      return;
    }

    onChange({ startDate: toISO(startDateObj), endDate: toISO(date) });
    setOpen(false);
  }

  const previewEnd = endDateObj ?? (startDateObj && hoverDate && hoverDate > startDateObj ? hoverDate : null);

  const triggerLabel = startDateObj
    ? endDateObj
      ? `${formatBR(startDateObj)} – ${formatBR(endDateObj)}`
      : `${formatBR(startDateObj)} – selecione a data final`
    : "Selecione o período";

  const monthLabel = viewMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Label htmlFor={inputId} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </Label>
      <button
        id={inputId}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm shadow-sm transition-colors",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
          hideLabel ? "mt-0" : "mt-1.5",
          startDateObj ? "text-neutral-900" : "text-neutral-400",
          error ? "border-danger-500" : "border-neutral-200",
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>
      {error && (
        <p role="alert" className="text-danger-500 mt-1 text-xs font-medium">
          {error}
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar período"
          className="absolute z-30 mt-1 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-md"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => setViewMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-neutral-900 capitalize">{monthLabel}</span>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => setViewMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            >
              ›
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-xs text-neutral-400">
            {WEEKDAY_LABELS.map((weekday, index) => (
              <span key={index}>{weekday}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
            {cells.map((date, index) => {
              if (!date) return <span key={index} />;

              const disabled = date < minDateObj;
              const unavailable = !disabled && isDateUnavailable(date, unavailableRanges);
              const isBlocked = disabled || unavailable;
              const isStart = startDateObj !== null && isSameDay(date, startDateObj);
              const isEnd = endDateObj !== null && isSameDay(date, endDateObj);
              const isInRange =
                !unavailable &&
                startDateObj !== null &&
                previewEnd !== null &&
                date > startDateObj &&
                date < previewEnd;
              const isToday = isSameDay(date, startOfToday());

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isBlocked}
                  aria-label={unavailable ? `${date.getDate()}, indisponível` : undefined}
                  onMouseEnter={() => setHoverDate(date)}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    disabled && "cursor-not-allowed text-neutral-300",
                    unavailable && "text-danger-500/70 line-through decoration-danger-500/70 cursor-not-allowed",
                    !isBlocked && !isStart && !isEnd && "text-neutral-700 hover:bg-neutral-100",
                    isInRange && "rounded-none bg-primary-50 text-primary-700",
                    (isStart || isEnd) && "bg-primary-600 text-white hover:bg-primary-600",
                    !isBlocked && !isStart && !isEnd && isToday && "font-semibold text-primary-700",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {unavailableRanges.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-danger-500/70" />
              Datas indisponíveis
            </p>
          )}

          {startDateObj && (
            <button
              type="button"
              onClick={() => {
                onChange({ startDate: "", endDate: "" });
                setHoverDate(null);
              }}
              className="mt-2 text-xs text-neutral-500 underline hover:text-neutral-700"
            >
              Limpar período
            </button>
          )}
        </div>
      )}
    </div>
  );
}
