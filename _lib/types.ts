export type TaskStatus =
  | "EM_DESENVOLVIMENTO"
  | "ENVIADO_STG"
  | "MR_ABERTA_PROD"
  | "CONCLUIDA";

export type Task = {
  id: string;
  workDayId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkDay = {
  id: string;
  date: string;
  label: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

export type ApiError = {
  message: string;
  code: string;
};
