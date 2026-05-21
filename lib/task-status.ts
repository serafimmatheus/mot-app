export const TASK_STATUSES = [
  "RASCUNHO",
  "ENVIADO_STG",
  "MR_ABERTA_PROD",
  "CONCLUIDA",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO_STG: "Enviado para STG",
  MR_ABERTA_PROD: "MR Aberta para Prod",
  CONCLUIDA: "Concluída",
};

export const TASK_STATUS_VARIANTS: Record<
  TaskStatus,
  "secondary" | "default" | "outline" | "destructive"
> = {
  RASCUNHO: "secondary",
  ENVIADO_STG: "default",
  MR_ABERTA_PROD: "outline",
  CONCLUIDA: "secondary",
};

export const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  RASCUNHO: "bg-muted text-muted-foreground",
  ENVIADO_STG: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  MR_ABERTA_PROD: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CONCLUIDA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export const TASK_STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  RASCUNHO: "hsl(240 4% 46%)",
  ENVIADO_STG: "hsl(217 91% 60%)",
  MR_ABERTA_PROD: "hsl(38 92% 50%)",
  CONCLUIDA: "hsl(142 71% 45%)",
};
