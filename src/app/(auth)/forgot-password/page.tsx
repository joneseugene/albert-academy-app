import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  return (
    <>
      <AuthHeading
        title="Forgot your password?"
        description="Enter your email and we'll send you a 6-digit code to set a new one."
      />
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <WithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function WithParams({ searchParams }: Pick<PageProps<"/forgot-password">, "searchParams">) {
  const { email } = await searchParams;
  return <ForgotPasswordForm email={typeof email === "string" ? email : ""} />;
}
