import type { Task, WorkDay } from "@/lib/types";

export type TaskSearchResult = {
  task: Task;
  day: WorkDay;
  code: string | null;
};

const LINEAR_CODE_RE = /SHURIDW-\d+/gi;

export function extractLinearCode(text: string): string | null {
  const match = text.match(LINEAR_CODE_RE);
  return match?.[0]?.toUpperCase() ?? null;
}

export function searchTasks(days: WorkDay[], query: string): TaskSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: TaskSearchResult[] = [];

  for (const day of days) {
    for (const task of day.tasks) {
      const searchable = `${task.title}\n${task.description ?? ""}`.toLowerCase();
      if (!searchable.includes(normalized)) continue;

      const code =
        extractLinearCode(task.title) ??
        extractLinearCode(task.description ?? "") ??
        null;

      results.push({ task, day, code });
    }
  }

  return results;
}
