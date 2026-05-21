import type { TaskStatus, Task, WorkDay } from "./types";
import { TASK_STATUSES } from "./task-status";

export type TaskWithDay = {
  task: Task;
  day: WorkDay;
};

export type StatusStat = {
  status: TaskStatus;
  count: number;
  percentage: number;
  tasks: TaskWithDay[];
};

export type DashboardStats = {
  total: number;
  byStatus: StatusStat[];
};

export function computeDashboardStats(days: WorkDay[]): DashboardStats {
  const tasksWithDay: TaskWithDay[] = [];

  for (const day of days) {
    for (const task of day.tasks) {
      tasksWithDay.push({ task, day });
    }
  }

  const total = tasksWithDay.length;

  const byStatus = TASK_STATUSES.map((status) => {
    const tasks = tasksWithDay.filter(({ task }) => task.status === status);
    return {
      status,
      count: tasks.length,
      percentage: total > 0 ? Math.round((tasks.length / total) * 100) : 0,
      tasks,
    };
  });

  return { total, byStatus };
}
