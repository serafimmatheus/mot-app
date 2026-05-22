import { TASK_STATUS_CARD_CLASSES, type TaskStatus } from "@/_lib/task-status";
import { cn } from "@/_lib/utils";

export function branchesFromDescription(description: string | null) {
  if (!description?.trim()) return [];
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getTaskCardClassName(status: TaskStatus, highlighted = false) {
  return cn(
    TASK_STATUS_CARD_CLASSES[status],
    highlighted &&
      "ring-2 ring-primary ring-offset-2 ring-offset-background transition-shadow",
  );
}
