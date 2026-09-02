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
  error?: string;
  className?: string;
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

// Calendário de intervalo em um único campo: primeiro clique define a data inicial, o segundo
// define a final (fecha sozinho); clicar antes da data inicial recomeça a seleção. Usado tanto no
// filtro do catálogo (§ período de disponibilidade) quanto no formulário de aluguel do produto.
export function DateRangePicker({ label, value, onChange, minDate, error, className }: DateRangePickerProps) {
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
    if (date < minDateObj) return;

    if (!startDateObj || endDateObj) {
      onChange({ startDate: toISO(date), endDate: "" });
      return;
    }
    if (date < startDateObj) {
      onChange({ startDate: toISO(date), endDate: "" });
      return;
    }
    if (isSameDay(date, startDateObj)) return;

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
      <Label htmlFor={inputId}>{label}</Label>
      <button
        id={inputId}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "mt-1.5 flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm shadow-sm transition-colors",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
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
              const isStart = startDateObj !== null && isSameDay(date, startDateObj);
              const isEnd = endDateObj !== null && isSameDay(date, endDateObj);
              const isInRange =
                startDateObj !== null && previewEnd !== null && date > startDateObj && date < previewEnd;
              const isToday = isSameDay(date, startOfToday());

              return (
                <button
                  key={index}
                  type="button"
                  disabled={disabled}
                  onMouseEnter={() => setHoverDate(date)}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    disabled && "cursor-not-allowed text-neutral-300",
                    !disabled && !isStart && !isEnd && "text-neutral-700 hover:bg-neutral-100",
                    isInRange && "rounded-none bg-primary-50 text-primary-700",
                    (isStart || isEnd) && "bg-primary-600 text-white hover:bg-primary-600",
                    !disabled && !isStart && !isEnd && isToday && "font-semibold text-primary-700",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

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
