"use client";

import { Copy, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskStatusSelect } from "@/components/task-status-select";
import type { Task, TaskStatus } from "@/lib/types";

import { TaskActionsPopover } from "./task-actions-popover";
import {
  branchesFromDescription,
  getTaskCardClassName,
} from "../_utils/task-card-utils";

type TaskCardProps = {
  task: Task;
  dayId: string;
  highlighted?: boolean;
  onStatusChange: (taskId: string, dayId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task, dayId: string) => void;
  onCopyBranch: (branch: string) => void;
};

export function TaskCard({
  task,
  dayId,
  highlighted = false,
  onStatusChange,
  onEdit,
  onDelete,
  onCopyBranch,
}: TaskCardProps) {
  const branches = branchesFromDescription(task.description);

  return (
    <Card
      id={`task-${task.id}`}
      className={getTaskCardClassName(task.status, highlighted)}
    >
      <CardHeader className="border-b border-inherit">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0">{task.title}</CardTitle>
              <TaskStatusSelect
                compact
                value={task.status}
                onChange={(status) => onStatusChange(task.id, dayId, status)}
              />
            </div>
            {branches.length > 0 ? (
              <CardDescription>
                {branches.length}{" "}
                {branches.length === 1 ? "branch" : "branches"}
              </CardDescription>
            ) : null}
          </div>
          <TaskActionsPopover
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task, dayId)}
          />
        </div>
      </CardHeader>
      {branches.length > 0 ? (
        <CardContent className="space-y-2 pt-4">
          {branches.map((branch) => (
            <div
              key={branch}
              className="flex items-center justify-between gap-2 rounded-lg bg-background/50 px-3 py-2 font-mono text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{branch}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCopyBranch(branch)}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      ) : task.description ? (
        <CardContent className="pt-4">
          <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
            {task.description}
          </pre>
        </CardContent>
      ) : null}
    </Card>
  );
}
