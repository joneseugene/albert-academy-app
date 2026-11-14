"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CheckboxField, PasswordField, TextField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { signInAction } from "../actions";
import { loginSchema, type LoginValues } from "../schemas";
import { AuthNotice } from "./auth-heading";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true, next },
  });
  const signIn = useServerMutation(signInAction, {
    toastErrors: false,
    onError: (e) => {
      form.resetField("password");
      setError(e.message);
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          setError(null);
          signIn.mutate(values);
        })}
      >
        {error && <AuthNotice>{error}</AuthNotice>}
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="you@albertacademy.edu.sl"
          autoFocus
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="current-password"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CheckboxField control={form.control} name="remember" label="Remember Me" />
          <Link
            href={routes.forgotPassword}
            onClick={(e) => {
              // Carry the typed email over to the reset form.
              const email = form.getValues("email").trim();
              if (email) {
                e.preventDefault();
                router.push(`${routes.forgotPassword}?email=${encodeURIComponent(email)}`);
              }
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="mt-1 h-11" disabled={signIn.isPending}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
