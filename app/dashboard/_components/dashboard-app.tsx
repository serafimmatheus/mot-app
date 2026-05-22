"use client";

import { format, parseISO } from "date-fns";
import {
  ArrowUpRight,
  CheckCircle2,
  FileEdit,
  GitPullRequest,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { AppHeader } from "@/_components/app-header";
import { TaskStatusBadge } from "@/_components/task-status-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/_components/ui/chart";
import { ScrollArea } from "@/_components/ui/scroll-area";
import { useDateRangeFilter } from "@/_hooks/use-date-range-filter";
import { listDays } from "@/_lib/api";
import {
  filterDaysByRange,
  formatDateRangeLabel,
  HEADER_OFFSET_CLASS,
} from "@/_lib/date-range-filter";
import { extractLinearCode } from "@/_lib/search-tasks";
import {
  TASK_STATUS_CHART_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@/_lib/task-status";
import type { WorkDay } from "@/_lib/types";

import { computeDashboardStats } from "../_utils/dashboard-stats";

const STATUS_ICONS: Record<TaskStatus, typeof FileEdit> = {
  EM_DESENVOLVIMENTO: FileEdit,
  ENVIADO_STG: Rocket,
  MR_ABERTA_PROD: GitPullRequest,
  CONCLUIDA: CheckCircle2,
};

const chartConfig = TASK_STATUSES.reduce((acc, status) => {
  acc[status] = {
    label: TASK_STATUS_LABELS[status],
    color: TASK_STATUS_CHART_COLORS[status],
  };
  return acc;
}, {} as ChartConfig);

/** ~5 itens da listagem (link com título + meta + gap). */
const STATUS_LIST_HEIGHT = "h-[19.5rem]";

type DashboardAppProps = {
  userName?: string | null;
};

export function DashboardApp({ userName }: DashboardAppProps) {
  const searchParams = useSearchParams();
  const { range, isDefault, getRangeLabel } = useDateRangeFilter();
  const [days, setDays] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDays = useCallback(async () => {
    try {
      setDays(await listDays());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDays();
  }, [loadDays]);

  const filteredDays = useMemo(
    () => filterDaysByRange(days, range),
    [days, range],
  );

  const stats = useMemo(
    () => computeDashboardStats(filteredDays),
    [filteredDays],
  );

  function buildOrganizerHref(dayId: string, taskId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", dayId);
    params.set("task", taskId);
    return `/?${params.toString()}`;
  }

  const chartData = stats.byStatus.map((item) => ({
    status: item.status,
    label: TASK_STATUS_LABELS[item.status],
    count: item.count,
    fill: TASK_STATUS_CHART_COLORS[item.status],
  }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader
        userName={userName}
        days={filteredDays}
        activeNav="dashboard"
      />

      <main className={`flex-1 overflow-y-auto ${HEADER_OFFSET_CLASS}`}>
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Visão geral das tarefas por status · {getRangeLabel(range)}
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : days.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-medium">Nenhuma tarefa cadastrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie tarefas no organizador para acompanhar os status aqui.
                </p>
              </CardContent>
            </Card>
          ) : filteredDays.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-medium">Nenhuma tarefa neste período</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isDefault
                    ? "Não há dias de trabalho no mês atual."
                    : `Nenhum dia entre ${formatDateRangeLabel(range)}.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.byStatus.map((item) => {
                  const Icon = STATUS_ICONS[item.status];
                  return (
                    <Card key={item.status}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardDescription className="line-clamp-2">
                            {TASK_STATUS_LABELS[item.status]}
                          </CardDescription>
                          <div
                            className="rounded-md p-2"
                            style={{
                              backgroundColor: `${TASK_STATUS_CHART_COLORS[item.status]}20`,
                            }}
                          >
                            <Icon
                              className="size-4"
                              style={{
                                color: TASK_STATUS_CHART_COLORS[item.status],
                              }}
                            />
                          </div>
                        </div>
                        <CardTitle className="text-3xl tabular-nums">
                          {item.count}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage}% do total ({stats.total} tarefas)
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tarefas por status</CardTitle>
                  <CardDescription>
                    Distribuição visual de {stats.total} tarefas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[280px] w-full"
                  >
                    <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, _name, item) => (
                              <span>
                                {item.payload.label}: {value} tarefa
                                {Number(value) === 1 ? "" : "s"}
                              </span>
                            )}
                          />
                        }
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                {stats.byStatus.map((item) => (
                  <Card
                    key={item.status}
                    className="flex min-w-0 flex-col overflow-hidden"
                  >
                    <CardHeader className="shrink-0 border-b">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {TASK_STATUS_LABELS[item.status]}
                          </CardTitle>
                          <CardDescription>
                            {item.count}{" "}
                            {item.count === 1 ? "tarefa" : "tarefas"}
                          </CardDescription>
                        </div>
                        <TaskStatusBadge status={item.status} />
                      </div>
                    </CardHeader>
                    <CardContent
                      className={`flex w-full max-w-full min-w-0 shrink-0 flex-col overflow-hidden pt-4 ${STATUS_LIST_HEIGHT}`}
                    >
                      {item.tasks.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            Nenhuma tarefa neste status
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-full w-full max-w-full min-w-0 overflow-hidden">
                          <ul className="w-full max-w-full min-w-0 space-y-2 pr-3">
                            {item.tasks.map(({ task, day }) => {
                              const code =
                                extractLinearCode(task.title) ??
                                extractLinearCode(task.description ?? "");
                              const dayLabel =
                                day.label ||
                                format(parseISO(day.date), "dd/MM/yyyy");

                              return (
                                <li
                                  key={task.id}
                                  className="w-full max-w-full min-w-0"
                                >
                                  <Link
                                    href={buildOrganizerHref(day.id, task.id)}
                                    className="flex w-full max-w-full min-w-0 items-start gap-3 overflow-hidden rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                                    title={task.title}
                                  >
                                    <div className="w-0 min-w-0 flex-1 overflow-hidden">
                                      <p className="truncate text-sm font-medium">
                                        {task.title}
                                      </p>
                                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                        {code ? (
                                          <span className="mr-2 font-mono text-primary">
                                            {code}
                                          </span>
                                        ) : null}
                                        {dayLabel}
                                      </p>
                                    </div>
                                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
