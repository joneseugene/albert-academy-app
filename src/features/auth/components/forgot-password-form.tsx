"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { requestPasswordResetAction } from "../actions";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { AuthNotice } from "./auth-heading";

export function ForgotPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email },
  });
  const request = useServerMutation(requestPasswordResetAction, {
    form,
    toastErrors: false,
    onError: (e) => setError(e.message),
    // Same next step whether or not the account exists.
    onSuccess: (_, { email }) =>
      router.push(`${routes.resetPassword}?email=${encodeURIComponent(email.trim())}`),
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          setError(null);
          request.mutate(values);
        })}
      >
        {error && <AuthNotice>{error}</AuthNotice>}
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@albertacademy.edu.sl"
          autoFocus
        />
        <Button type="submit" size="lg" className="h-11" disabled={request.isPending}>
          {request.isPending ? "Sending code…" : "Send code"}
        </Button>
        <Link
          href={routes.login}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to sign in
        </Link>
      </form>
    </Form>
  );
}
