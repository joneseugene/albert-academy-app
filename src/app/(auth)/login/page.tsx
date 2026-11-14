import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthHeading, AuthNotice } from "@/features/auth/components/auth-heading";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <AuthHeading title="Sign in" description="Manage the App." />
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LoginFormWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next, reset } = await searchParams;
  return (
    <div className="grid gap-5">
      {reset === "1" && (
        <AuthNotice tone="success">Your password was changed. Sign in with the new one.</AuthNotice>
      )}
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
