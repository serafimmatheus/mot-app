import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { WorkDay } from "./types";

export type DateRange = {
  from: string;
  to: string;
};

export function getCurrentMonthRange(reference = new Date()): DateRange {
  return {
    from: format(startOfMonth(reference), "yyyy-MM-dd"),
    to: format(endOfMonth(reference), "yyyy-MM-dd"),
  };
}

export function resolveDateRange(
  from: string | null | undefined,
  to: string | null | undefined,
): DateRange {
  if (from?.trim() && to?.trim()) {
    return { from: from.trim(), to: to.trim() };
  }
  return getCurrentMonthRange();
}

export function isUsingDefaultMonthRange(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  return !from?.trim() || !to?.trim();
}

export function formatDateRangeLabel(range: DateRange): string {
  const fromLabel = format(parseISO(range.from), "dd/MM/yyyy");
  const toLabel = format(parseISO(range.to), "dd/MM/yyyy");
  return `${fromLabel} — ${toLabel}`;
}

export function formatCurrentMonthLabel(reference = new Date()): string {
  return format(reference, "MMMM yyyy", { locale: ptBR });
}

export function filterDaysByRange(
  days: WorkDay[],
  range: DateRange,
): WorkDay[] {
  return days.filter((day) => day.date >= range.from && day.date <= range.to);
}

export const HEADER_OFFSET_CLASS = "pt-[6.75rem]";
export const HEADER_TOP_CLASS = "top-[6.75rem]";
export const HEADER_HEIGHT_CLASS = "h-[6.75rem]";
