export const TASK_STATUSES = [
  "EM_DESENVOLVIMENTO",
  "ENVIADO_STG",
  "MR_ABERTA_PROD",
  "CONCLUIDA",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  EM_DESENVOLVIMENTO: "Em desenvolvimento",
  ENVIADO_STG: "Enviado para STG",
  MR_ABERTA_PROD: "MR Aberta para Prod",
  CONCLUIDA: "Concluída",
};

export const TASK_STATUS_VARIANTS: Record<
  TaskStatus,
  "secondary" | "default" | "outline" | "destructive"
> = {
  EM_DESENVOLVIMENTO: "secondary",
  ENVIADO_STG: "default",
  MR_ABERTA_PROD: "outline",
  CONCLUIDA: "secondary",
};

export const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  EM_DESENVOLVIMENTO: "bg-muted text-muted-foreground",
  ENVIADO_STG: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  MR_ABERTA_PROD: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CONCLUIDA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export const TASK_STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  EM_DESENVOLVIMENTO: "hsl(240 4% 46%)",
  ENVIADO_STG: "hsl(217 91% 60%)",
  MR_ABERTA_PROD: "hsl(38 92% 50%)",
  CONCLUIDA: "hsl(142 71% 45%)",
};

export const TASK_STATUS_CARD_CLASSES: Record<TaskStatus, string> = {
  EM_DESENVOLVIMENTO: "border-muted-foreground/25 bg-muted/30",
  ENVIADO_STG: "border-blue-500/35 bg-blue-500/10",
  MR_ABERTA_PROD: "border-amber-500/35 bg-amber-500/10",
  CONCLUIDA: "border-emerald-500/35 bg-emerald-500/10",
};
