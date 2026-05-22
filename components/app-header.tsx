"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, ListTodo, LogOut } from "lucide-react";

import { DateRangeFilterBar } from "@/components/date-range-filter";
import { TaskSearch } from "@/components/task-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import type { TaskSearchResult } from "@/lib/search-tasks";
import type { WorkDay } from "@/lib/types";

type AppHeaderProps = {
  userName?: string | null;
  days?: WorkDay[];
  activeNav: "organizer" | "dashboard";
  onSearchSelect?: (result: TaskSearchResult) => void;
};

const navItems = [
  { href: "/", label: "Organizador", icon: ListTodo, key: "organizer" as const },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard" as const,
  },
];

function buildNavHref(path: string, search: string) {
  return search ? `${path}?${search}` : path;
}

export function AppHeader({
  userName,
  days = [],
  activeNav,
  onSearchSelect,
}: AppHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function handleSearch(result: TaskSearchResult) {
    if (onSearchSelect) {
      onSearchSelect(result);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("day", result.day.id);
    params.set("task", result.task.id);
    router.push(`/?${params.toString()}`);
  }

  async function handleLogout() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] md:gap-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <div className="hidden min-w-0 sm:block">
            <h1 className="truncate text-sm font-semibold tracking-tight md:text-base">
              Meu Organizador de Tasks
            </h1>
            {userName ? (
              <p className="truncate text-xs text-muted-foreground">
                Olá, {userName}
              </p>
            ) : null}
          </div>

          <nav className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <Link
                  key={item.key}
                  href={buildNavHref(item.href, query)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 md:size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <TaskSearch days={days} onSelect={handleSearch} className="mx-auto w-full" />

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      <DateRangeFilterBar />
    </header>
  );
}
