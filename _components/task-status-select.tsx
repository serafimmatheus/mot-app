"use client";

import { Badge } from "@/_components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  TASK_STATUS_CLASSES,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@/_lib/task-status";
import { cn } from "@/_lib/utils";

type TaskStatusSelectProps = {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-normal", TASK_STATUS_CLASSES[status], className)}
    >
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TaskStatusSelect({
  value,
  onChange,
  disabled,
  compact,
}: TaskStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as TaskStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        size={compact ? "sm" : "default"}
        className={cn("w-auto min-w-[10rem]", TASK_STATUS_CLASSES[value])}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {TASK_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
