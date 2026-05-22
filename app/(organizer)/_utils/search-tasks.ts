import type { Task, WorkDay } from "@/_lib/types";

export type TaskSearchResult = {
  task: Task;
  day: WorkDay;
  code: string | null;
};

const LINEAR_CODE_RE = /SHURIDW-\d+/gi;
const LINEAR_ISSUE_BASE_URL = "https://linear.app/contraktorx/issue";

export function extractLinearCode(text: string): string | null {
  const match = text.match(LINEAR_CODE_RE);
  return match?.[0]?.toUpperCase() ?? null;
}

export function getTaskLinearCode(task: Task): string | null {
  return (
    extractLinearCode(task.title) ?? extractLinearCode(task.description ?? "")
  );
}

export function buildLinearIssueUrl(code: string): string {
  return `${LINEAR_ISSUE_BASE_URL}/${code}`;
}

export function searchTasks(
  days: WorkDay[],
  query: string,
): TaskSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: TaskSearchResult[] = [];

  for (const day of days) {
    for (const task of day.tasks) {
      const searchable =
        `${task.title}\n${task.description ?? ""}`.toLowerCase();
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
