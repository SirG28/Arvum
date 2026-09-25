// Formata como "yyyy-mm-dd" usando os componentes locais da data (não toISOString, que é UTC e
// pode voltar um dia por causa do fuso) — mesma convenção usada pelo DateRangePicker no cliente.
export function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
