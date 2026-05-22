"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { WorkDay } from "@/_lib/types";

import type { TaskSearchResult } from "../_utils/search-tasks";

export function useTaskHighlight(
  days: WorkDay[],
  selectedDayId: string | null,
) {
  const searchParams = useSearchParams();
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null,
  );
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const dayId = searchParams.get("day");
    const taskId = searchParams.get("task");
    if (!dayId || days.length === 0) return;

    if (taskId) {
      setHighlightedTaskId(taskId);
    }
  }, [searchParams, days]);

  useEffect(() => {
    if (!highlightedTaskId) return;

    const element = document.getElementById(`task-${highlightedTaskId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTaskId(null);
    }, 3000);

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [highlightedTaskId, selectedDayId]);

  function highlightFromSearch(result: TaskSearchResult) {
    setHighlightedTaskId(result.task.id);
  }

  return {
    highlightedTaskId,
    setHighlightedTaskId,
    highlightFromSearch,
  };
}
