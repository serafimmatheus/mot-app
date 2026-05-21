import type { ApiError, Task, TaskStatus, WorkDay } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5555";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const hasBody = init?.body !== undefined && init?.body !== null;

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? "Erro na requisição");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listDays(): Promise<WorkDay[]> {
  const data = await request<{ days: WorkDay[] }>("/days");
  return data.days;
}

export async function createDay(input: {
  date: string;
  label?: string;
}): Promise<WorkDay> {
  const data = await request<{ day: WorkDay }>("/days", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.day;
}

export async function updateDay(
  dayId: string,
  input: { date?: string; label?: string | null },
): Promise<WorkDay> {
  const data = await request<{ day: WorkDay }>(`/days/${dayId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.day;
}

export async function deleteDay(dayId: string): Promise<void> {
  await request(`/days/${dayId}`, { method: "DELETE" });
}

export async function createTask(
  dayId: string,
  input: { title: string; description?: string },
): Promise<Task> {
  const data = await request<{ task: Task }>(`/days/${dayId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function updateTask(
  taskId: string,
  input: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    sortOrder?: number;
  },
): Promise<Task> {
  const data = await request<{ task: Task }>(`/days/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await request(`/days/tasks/${taskId}`, { method: "DELETE" });
}
