"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/_components/ui/spinner";
import { useSession } from "@/_lib/auth-client";

import { OrganizerApp } from "./_components/organizer-app";

function OrganizerContent({ userName }: { userName?: string | null }) {
  return <OrganizerApp userName={userName} />;
}

export default function HomePage() {
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
      <OrganizerContent userName={session.user.name} />
    </Suspense>
  );
}
