"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  formatCurrentMonthLabel,
  formatDateRangeLabel,
  isUsingDefaultMonthRange,
  resolveDateRange,
  type DateRange,
} from "@/lib/date-range-filter";

export function useDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const isDefault = isUsingDefaultMonthRange(fromParam, toParam);

  const range = useMemo(
    () => resolveDateRange(fromParam, toParam),
    [fromParam, toParam],
  );

  function updateParams(nextFrom: string | null, nextTo: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFrom?.trim() && nextTo?.trim()) {
      params.set("from", nextFrom.trim());
      params.set("to", nextTo.trim());
    } else {
      params.delete("from");
      params.delete("to");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function setRange(from: string, to: string) {
    updateParams(from, to);
  }

  function clearRange() {
    updateParams(null, null);
  }

  function getRangeLabel(currentRange: DateRange) {
    if (isDefault) {
      return `Mês atual (${formatCurrentMonthLabel()})`;
    }
    return formatDateRangeLabel(currentRange);
  }

  return {
    fromParam: fromParam ?? "",
    toParam: toParam ?? "",
    range,
    isDefault,
    setRange,
    clearRange,
    getRangeLabel,
  };
}
