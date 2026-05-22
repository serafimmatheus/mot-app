"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardApp } from "./_components/dashboard-app";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";

function DashboardContent({ userName }: { userName?: string | null }) {
  return <DashboardApp userName={userName} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <DashboardContent userName={session.user.name} />
    </Suspense>
  );
}
