"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PasswordField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useServerMutation } from "@/hooks/use-server-action";
import { changePasswordAction } from "../actions";
import { changePasswordSchema, PASSWORD_HINT, type ChangePasswordValues } from "../schemas";

const EMPTY: ChangePasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });
  const change = useServerMutation(changePasswordAction, {
    form,
    successMessage: "Password changed. Your other sessions were signed out.",
    onSuccess: () => form.reset(EMPTY),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => change.mutate(v))} className="grid gap-4" noValidate>
        <PasswordField
          control={form.control}
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
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
        <Button type="submit" className="justify-self-start" disabled={change.isPending}>
          {change.isPending ? "Saving…" : "Change password"}
        </Button>
      </form>
    </Form>
  );
}
