"use client";

import { CalendarRange, X } from "lucide-react";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { useDateRangeFilter } from "@/_hooks/use-date-range-filter";

export function DateRangeFilterBar() {
  const {
    fromParam,
    toParam,
    range,
    isDefault,
    setRange,
    clearRange,
    getRangeLabel,
  } = useDateRangeFilter();

  function handleFromChange(value: string) {
    const nextTo = toParam || range.to;
    if (!value) {
      if (!toParam) {
        clearRange();
        return;
      }
      return;
    }
    setRange(value, nextTo);
  }

  function handleToChange(value: string) {
    const nextFrom = fromParam || range.from;
    if (!value) {
      if (!fromParam) {
        clearRange();
        return;
      }
      return;
    }
    setRange(nextFrom, value);
  }

  return (
    <div className="border-t bg-background/95 px-4 py-2 md:px-6">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarRange className="size-3.5" />
          <span className="hidden sm:inline">Período:</span>
          <span className="font-medium text-foreground">
            {getRangeLabel(range)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromParam}
            onChange={(event) => handleFromChange(event.target.value)}
            className="h-8 w-[9.5rem] bg-muted/40 text-xs"
            aria-label="Data inicial"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            value={toParam}
            onChange={(event) => handleToChange(event.target.value)}
            className="h-8 w-[9.5rem] bg-muted/40 text-xs"
            aria-label="Data final"
          />
        </div>

        {!isDefault ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={clearRange}
          >
            <X className="size-3.5" />
            Mês atual
          </Button>
        ) : null}
      </div>
    </div>
  );
}
