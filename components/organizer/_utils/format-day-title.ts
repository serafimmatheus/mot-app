import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { WorkDay } from "@/lib/types";

export function formatDayTitle(day: WorkDay) {
  const dateLabel = format(parseISO(day.date), "dd/MM/yyyy (EEEE)", {
    locale: ptBR,
  });
  return day.label ? `${day.label} — ${dateLabel}` : dateLabel;
}
