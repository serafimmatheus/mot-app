"use client";

import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/_components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { buildLinearIssueUrl, getTaskLinearCode } from "@/_lib/search-tasks";
import type { Task } from "@/_lib/types";
import { cn } from "@/_lib/utils";

const menuItemClassName =
  "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground";

type TaskActionsPopoverProps = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskActionsPopover({
  task,
  onEdit,
  onDelete,
}: TaskActionsPopoverProps) {
  const [open, setOpen] = useState(false);
  const linearCode = getTaskLinearCode(task);
  const linearUrl = linearCode ? buildLinearIssueUrl(linearCode) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Ações da tarefa">
          <MoreHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        {linearUrl ? (
          <a
            href={linearUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(menuItemClassName, "text-foreground")}
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="size-4 shrink-0" />
            Abrir no Linear
          </a>
        ) : null}
        <button
          type="button"
          className={menuItemClassName}
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
          <Pencil className="size-4 shrink-0" />
          Editar
        </button>
        <button
          type="button"
          className={cn(
            menuItemClassName,
            "text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        >
          <Trash2 className="size-4 shrink-0" />
          Excluir
        </button>
      </PopoverContent>
    </Popover>
  );
}
