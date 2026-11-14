"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PasswordField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { requestPasswordResetAction, resetPasswordAction } from "../actions";
import { PASSWORD_HINT, resetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { AuthNotice } from "./auth-heading";

const RESEND_AFTER_SECONDS = 60;

export function ResetPasswordForm({ email }: { email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_AFTER_SECONDS);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, code: "", newPassword: "", confirmPassword: "" },
  });

  const reset = useServerMutation(resetPasswordAction, {
    form,
    toastErrors: false,
    onError: (e) => {
      setError(e.message);
      form.resetField("code");
      form.setFocus("code");
    },
  });
  const resend = useServerMutation(requestPasswordResetAction, {
    toastErrors: true,
    onSuccess: () => {
      toast.success("If the account exists, a new code is on its way");
      setWait(RESEND_AFTER_SECONDS);
      setError(null);
    },
  });

  // Count down until "Send a new code" is available.
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          setError(null);
          reset.mutate(values);
        })}
      >
        {error && <AuthNotice>{error}</AuthNotice>}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 text-center font-mono text-2xl tracking-[0.5em] placeholder:text-muted-foreground/40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PasswordField
          control={form.control}
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          description={PASSWORD_HINT}
        />
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
        />
        <Button type="submit" size="lg" className="mt-1 h-11" disabled={reset.isPending}>
          {reset.isPending ? "Saving…" : "Set new password"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            disabled={wait > 0 || resend.isPending}
            onClick={() => resend.mutate({ email })}
          >
            {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
          </Button>
          <Link
            href={`${routes.forgotPassword}?email=${encodeURIComponent(email)}`}
            className="text-muted-foreground hover:text-foreground"
          >
            Use a different email
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Can&apos;t find it? Check your spam folder. Codes expire after 15 minutes.{" "}
          <Link href={routes.login} className="underline hover:text-foreground">
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
