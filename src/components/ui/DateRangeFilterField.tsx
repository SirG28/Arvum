"use client";

import { useState } from "react";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

interface DateRangeFilterFieldProps {
  startFieldName: string;
  endFieldName: string;
  label: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
  className?: string;
  hideLabel?: boolean;
}

// Adapta o DateRangePicker (controlado) para um form GET sem JS no submit — mantém o estado local
// e espelha em dois inputs ocultos, mesmo padrão do CityAutocomplete nesta mesma tela.
export function DateRangeFilterField({
  startFieldName,
  endFieldName,
  label,
  defaultStartDate,
  defaultEndDate,
  className,
  hideLabel,
}: DateRangeFilterFieldProps) {
  const [range, setRange] = useState<DateRange>({
    startDate: defaultStartDate ?? "",
    endDate: defaultEndDate ?? "",
  });

  return (
    <div className={className}>
      <DateRangePicker label={label} value={range} onChange={setRange} hideLabel={hideLabel} />
      <input type="hidden" name={startFieldName} value={range.startDate} />
      <input type="hidden" name={endFieldName} value={range.endDate} />
    </div>
  );
}
