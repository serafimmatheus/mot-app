"use client";

import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchTasks, type TaskSearchResult } from "@/lib/search-tasks";
import { TASK_STATUS_LABELS } from "@/lib/task-status";
import type { WorkDay } from "@/lib/types";

type TaskSearchProps = {
  days: WorkDay[];
  onSelect: (result: TaskSearchResult) => void;
  className?: string;
};

export function TaskSearch({ days, onSelect, className }: TaskSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchTasks(days, query), [days, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: TaskSearchResult) {
    onSelect(result);
    setQuery("");
    setOpen(false);
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          placeholder="Buscar código (ex.: 544 ou SHURIDW-544)"
          className="h-9 bg-muted/40 pl-9"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              handleSelect(results[0]);
            }
          }}
        />
      </div>

      {showDropdown ? (
        <div className="absolute top-[calc(100%+4px)] z-50 max-h-72 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-md ring-1 ring-foreground/10">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhuma tarefa encontrada para &quot;{query.trim()}&quot;
            </p>
          ) : (
            results.map((result) => (
              <button
                key={result.task.id}
                type="button"
                className="flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                onClick={() => handleSelect(result)}
              >
                <span className="truncate text-sm font-medium">
                  {result.task.title}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {result.code ? (
                    <span className="font-mono text-primary">{result.code}</span>
                  ) : null}
                  <span>{TASK_STATUS_LABELS[result.task.status]}</span>
                  <span>
                    {result.day.label ||
                      format(parseISO(result.day.date), "dd/MM/yyyy")}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
