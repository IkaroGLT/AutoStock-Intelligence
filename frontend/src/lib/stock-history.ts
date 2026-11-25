import type { Movement, Product } from "../types/inventory";

// Datas locais, sem conversão para UTC, para respeitar o dia selecionado.
export function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function movementDate(value: string): Date | null {
  const match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2}))?/,
  );
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] ?? 0),
      Number(match[5] ?? 0),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// Demonstração local: reconstrói saldos a partir das movimentações registradas.
// Dias anteriores ao primeiro lançamento ficam sem dados, não são inventados.
export function buildStockHistory(
  products: Product[],
  movements: Movement[],
  period: string,
  referenceDate: string,
): { day: string; total: number | null }[] {
  const [year, month, day] = referenceDate.split("-").map(Number);
  const selected = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = Number.isNaN(selected.getTime()) || selected.getTime() > todayStart.getTime()
    ? todayStart
    : selected;
  const numberOfDays = period.includes("90") ? 90 : period.includes("30") ? 30 : 7;
  const currentUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const datedMovements = movements
    .map((movement) => ({ timestamp: movementDate(movement.date)?.getTime(), delta: movement.quantity }))
    .filter((movement): movement is { timestamp: number; delta: number } =>
      movement.timestamp !== undefined && Number.isFinite(movement.timestamp),
    );
  const firstEvent = datedMovements.length
    ? Math.min(...datedMovements.map((movement) => movement.timestamp))
    : Number.POSITIVE_INFINITY;

  return Array.from({ length: numberOfDays }, (_, index) => {
    const currentDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - numberOfDays + index + 1);
    const dayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59, 999).getTime();
    const label = `${String(currentDay.getDate()).padStart(2, "0")}/${String(currentDay.getMonth() + 1).padStart(2, "0")}`;
    if (dayEnd < firstEvent && localDateValue(currentDay) !== localDateValue(today)) {
      return { day: label, total: null };
    }
    const subsequentDelta = datedMovements
      .filter((movement) => movement.timestamp > dayEnd)
      .reduce((sum, movement) => sum + movement.delta, 0);
    return { day: label, total: currentUnits - subsequentDelta };
  });
}
