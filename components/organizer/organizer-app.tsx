"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Copy, GitBranch, Pencil, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  createDay,
  createTask,
  deleteDay,
  deleteTask,
  listDays,
  updateDay,
  updateTask,
} from "@/lib/api";
import {
  filterDaysByRange,
  HEADER_OFFSET_CLASS,
  HEADER_TOP_CLASS,
} from "@/lib/date-range-filter";
import type { TaskSearchResult } from "@/lib/search-tasks";
import type { Task, TaskStatus, WorkDay } from "@/lib/types";

import { AppHeader } from "@/components/app/app-header";
import { useDateRangeFilter } from "@/hooks/use-date-range-filter";
import { TaskActionsPopover } from "./task-actions-popover";
import { TaskStatusSelect } from "./task-status-select";

function formatDayTitle(day: WorkDay) {
  const dateLabel = format(parseISO(day.date), "dd/MM/yyyy (EEEE)", {
    locale: ptBR,
  });
  return day.label ? `${day.label} — ${dateLabel}` : dateLabel;
}

function branchesFromDescription(description: string | null) {
  if (!description?.trim()) return [];
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

type DayFormState = {
  open: boolean;
  mode: "create" | "edit";
  dayId?: string;
  date: string;
  label: string;
};

type TaskFormState = {
  open: boolean;
  mode: "create" | "edit";
  taskId?: string;
  title: string;
  description: string;
};

type DeleteTarget =
  | { type: "day"; day: WorkDay }
  | { type: "task"; task: Task; dayId: string };

export function OrganizerApp({ userName }: { userName?: string | null }) {
  const searchParams = useSearchParams();
  const { range } = useDateRangeFilter();
  const [days, setDays] = useState<WorkDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayForm, setDayForm] = useState<DayFormState>({
    open: false,
    mode: "create",
    date: new Date().toISOString().slice(0, 10),
    label: "",
  });
  const [taskForm, setTaskForm] = useState<TaskFormState>({
    open: false,
    mode: "create",
    title: "",
    description: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null,
  );
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const filteredDays = useMemo(
    () => filterDaysByRange(days, range),
    [days, range],
  );

  const selectedDay = filteredDays.find((day) => day.id === selectedDayId) ?? null;

  const loadDays = useCallback(async () => {
    try {
      const data = await listDays();
      setDays(data);
      setSelectedDayId((current) => {
        const inRange = filterDaysByRange(data, range);
        if (current && inRange.some((day) => day.id === current)) return current;
        return inRange[0]?.id ?? null;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar dias");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (filteredDays.length === 0) {
      setSelectedDayId(null);
      return;
    }

    if (
      !selectedDayId ||
      !filteredDays.some((day) => day.id === selectedDayId)
    ) {
      setSelectedDayId(filteredDays[0].id);
    }
  }, [filteredDays, selectedDayId]);

  useEffect(() => {
    void loadDays();
  }, [loadDays]);

  useEffect(() => {
    const dayId = searchParams.get("day");
    const taskId = searchParams.get("task");
    if (!dayId || days.length === 0) return;

    if (days.some((day) => day.id === dayId)) {
      setSelectedDayId(dayId);
    }

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

  function handleSearchSelect(result: TaskSearchResult) {
    setSelectedDayId(result.day.id);
    setHighlightedTaskId(result.task.id);
  }

  async function handleSaveDay() {
    setSaving(true);
    try {
      if (dayForm.mode === "create") {
        const day = await createDay({
          date: dayForm.date,
          label: dayForm.label.trim() || undefined,
        });
        setDays((prev) => [day, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
        setSelectedDayId(day.id);
        toast.success("Dia criado");
      } else if (dayForm.dayId) {
        const day = await updateDay(dayForm.dayId, {
          date: dayForm.date,
          label: dayForm.label.trim() || null,
        });
        setDays((prev) =>
          prev
            .map((item) => (item.id === day.id ? day : item))
            .sort((a, b) => b.date.localeCompare(a.date)),
        );
        toast.success("Dia atualizado");
      }
      setDayForm((prev) => ({ ...prev, open: false }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar dia");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTask() {
    if (!selectedDay) return;
    setSaving(true);
    try {
      if (taskForm.mode === "create") {
        const task = await createTask(selectedDay.id, {
          title: taskForm.title.trim(),
          description: taskForm.description,
        });
        setDays((prev) =>
          prev.map((day) =>
            day.id === selectedDay.id
              ? { ...day, tasks: [...day.tasks, task] }
              : day,
          ),
        );
        toast.success("Tarefa criada");
      } else if (taskForm.taskId) {
        const task = await updateTask(taskForm.taskId, {
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || null,
        });
        setDays((prev) =>
          prev.map((day) =>
            day.id === selectedDay.id
              ? {
                  ...day,
                  tasks: day.tasks.map((item) =>
                    item.id === task.id ? task : item,
                  ),
                }
              : day,
          ),
        );
        toast.success("Tarefa atualizada");
      }
      setTaskForm((prev) => ({ ...prev, open: false }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar tarefa");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === "day") {
        await deleteDay(deleteTarget.day.id);
        setDays((prev) => prev.filter((day) => day.id !== deleteTarget.day.id));
        setSelectedDayId((current) =>
          current === deleteTarget.day.id ? null : current,
        );
        toast.success("Dia removido");
      } else {
        await deleteTask(deleteTarget.task.id);
        setDays((prev) =>
          prev.map((day) =>
            day.id === deleteTarget.dayId
              ? {
                  ...day,
                  tasks: day.tasks.filter((task) => task.id !== deleteTarget.task.id),
                }
              : day,
          ),
        );
        toast.success("Tarefa removida");
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId: string, dayId: string, status: TaskStatus) {
    try {
      const task = await updateTask(taskId, { status });
      setDays((prev) =>
        prev.map((day) =>
          day.id === dayId
            ? {
                ...day,
                tasks: day.tasks.map((item) =>
                  item.id === task.id ? task : item,
                ),
              }
            : day,
        ),
      );
      toast.success("Status atualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  }

  async function copyBranch(branch: string) {
    await navigator.clipboard.writeText(branch);
    toast.success("Branch copiada");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader
        userName={userName}
        days={filteredDays}
        activeNav="organizer"
        onSearchSelect={handleSearchSelect}
      />

      <div className={`flex min-h-0 flex-1 ${HEADER_OFFSET_CLASS}`}>
        <aside
          className={`fixed ${HEADER_TOP_CLASS} left-0 z-40 flex h-44 w-full shrink-0 flex-col border-b bg-background md:h-[calc(100vh-6.75rem)] md:w-80 md:border-r md:border-b-0`}
        >
          <div className="flex shrink-0 items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4" />
              Dias de trabalho
            </div>
            <Button
              size="sm"
              onClick={() =>
                setDayForm({
                  open: true,
                  mode: "create",
                  date: new Date().toISOString().slice(0, 10),
                  label: "",
                })
              }
            >
              <Plus className="size-4" />
              Novo dia
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-1 p-2 pb-4">
              {loading ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Carregando...
                </p>
              ) : days.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Nenhum dia cadastrado. Crie o primeiro dia de trabalho.
                </p>
              ) : filteredDays.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Nenhum dia de trabalho neste período.
                </p>
              ) : (
                filteredDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedDayId === day.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {day.label || format(parseISO(day.date), "dd/MM")}
                    </div>
                    <div
                      className={`text-xs ${
                        selectedDayId === day.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(parseISO(day.date), "dd/MM/yyyy")} · {day.tasks.length}{" "}
                      {day.tasks.length === 1 ? "tarefa" : "tarefas"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto pt-44 md:ml-80 md:pt-0">
          <div className="p-4 md:p-6">
          {!selectedDay ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed">
              <div className="text-center">
                <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">Selecione ou crie um dia</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Organize suas tarefas do Linear e branches por dia de trabalho
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {formatDayTitle(selectedDay)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedDay.tasks.length}{" "}
                    {selectedDay.tasks.length === 1 ? "tarefa" : "tarefas"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDayForm({
                        open: true,
                        mode: "edit",
                        dayId: selectedDay.id,
                        date: selectedDay.date,
                        label: selectedDay.label ?? "",
                      })
                    }
                  >
                    <Pencil className="size-4" />
                    Editar dia
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setDeleteTarget({ type: "day", day: selectedDay })
                    }
                  >
                    <Trash2 className="size-4" />
                    Excluir dia
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setTaskForm({
                        open: true,
                        mode: "create",
                        title: "",
                        description: "",
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Nova tarefa
                  </Button>
                </div>
              </div>

              <Separator />

              {selectedDay.tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="font-medium">Nenhuma tarefa neste dia</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adicione o nome da task do Linear e as branches na descrição
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDay.tasks.map((task) => {
                    const branches = branchesFromDescription(task.description);
                    return (
                      <Card
                        key={task.id}
                        id={`task-${task.id}`}
                        className={
                          highlightedTaskId === task.id
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background transition-shadow"
                            : undefined
                        }
                      >
                        <CardHeader className="border-b">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="min-w-0">
                                  {task.title}
                                </CardTitle>
                                <TaskStatusSelect
                                  compact
                                  value={task.status}
                                  onChange={(status) =>
                                    void handleStatusChange(
                                      task.id,
                                      selectedDay.id,
                                      status,
                                    )
                                  }
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
                              onEdit={() =>
                                setTaskForm({
                                  open: true,
                                  mode: "edit",
                                  taskId: task.id,
                                  title: task.title,
                                  description: task.description ?? "",
                                })
                              }
                              onDelete={() =>
                                setDeleteTarget({
                                  type: "task",
                                  task,
                                  dayId: selectedDay.id,
                                })
                              }
                            />
                          </div>
                        </CardHeader>
                        {branches.length > 0 ? (
                          <CardContent className="space-y-2 pt-4">
                            {branches.map((branch) => (
                              <div
                                key={branch}
                                className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 font-mono text-sm"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
                                  <span className="truncate">{branch}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => void copyBranch(branch)}
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
                  })}
                </div>
              )}
            </div>
          )}
          </div>
        </main>
      </div>

      <Dialog
        open={dayForm.open}
        onOpenChange={(open) => setDayForm((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dayForm.mode === "create" ? "Novo dia" : "Editar dia"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="day-date">Data</Label>
              <Input
                id="day-date"
                type="date"
                value={dayForm.date}
                onChange={(e) =>
                  setDayForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-label">Rótulo (opcional)</Label>
              <Input
                id="day-label"
                placeholder='Ex.: "dia 08", "dia 21"'
                value={dayForm.label}
                onChange={(e) =>
                  setDayForm((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDayForm((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button disabled={saving} onClick={() => void handleSaveDay()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={taskForm.open}
        onOpenChange={(open) => setTaskForm((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {taskForm.mode === "create" ? "Nova tarefa" : "Editar tarefa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Nome da tarefa</Label>
              <Input
                id="task-title"
                placeholder="Ex.: Status da assinatura em tempo real"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="task-branches">Branches</Label>
                <Badge variant="secondary">uma por linha</Badge>
              </div>
              <Textarea
                id="task-branches"
                rows={8}
                placeholder={`feat/SHURIDW-475-F\nfeat/SHURIDW-475-F-stg\nfeat/SHURIDW-475-B\nfeat/SHURIDW-475-B-stg`}
                className="font-mono text-sm"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTaskForm((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              disabled={saving || !taskForm.title.trim()}
              onClick={() => void handleSaveTask()}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "day"
                ? `Remover o dia "${deleteTarget.day.label || format(parseISO(deleteTarget.day.date), "dd/MM/yyyy")}" e todas as tarefas?`
                : `Remover a tarefa "${deleteTarget?.task.title}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {saving ? "Removendo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
