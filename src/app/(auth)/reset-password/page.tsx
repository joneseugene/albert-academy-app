import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <WithParams searchParams={searchParams} />
    </Suspense>
  );
}

async function WithParams({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { email } = await searchParams;
  if (typeof email !== "string" || !email) redirect(routes.forgotPassword);
  return (
    <>
      <AuthHeading
        title="Check your email"
        description={
          <>
            If <span className="font-medium text-foreground">{email}</span> has an account, we sent
            it a 6-digit code. Enter it below with your new password.
          </>
        }
      />
      <ResetPasswordForm email={email} />
    </>
  );
}
