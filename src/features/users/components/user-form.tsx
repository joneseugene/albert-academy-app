"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, PasswordField, SelectField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { PASSWORD_HINT } from "@/features/auth/schemas";
import { useServerMutation } from "@/hooks/use-server-action";
import { USER_STATUSES } from "@/lib/auth/access";
import { useCurrentUser } from "@/providers/session-provider";
import { createUserAction, updateUserAction } from "../actions";
import {
  USER_STATUS_LABELS,
  createUserSchema,
  editUserSchema,
  type CreateUserValues,
  type Role,
  type User,
} from "../schemas";

/** Create (no `user`) or edit a user. */
export function UserForm({ user, roles }: { user?: User; roles: Role[] }) {
  const me = useCurrentUser();
  const editing = Boolean(user);
  const isMe = user?.id === me.id;

  const initial: CreateUserValues = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    roleId: user?.roleId ?? "",
    status: user?.status ?? "active",
    password: "",
    confirmPassword: "",
  };
  const form = useForm<CreateUserValues>({
    // One form shape for both modes; editing validates with the edit schema (no email,
    // password optional).
    resolver: (editing
      ? zodResolver(editUserSchema)
      : zodResolver(createUserSchema)) as Resolver<CreateUserValues>,
    defaultValues: initial,
    values: user ? initial : undefined,
  });

  const create = useServerMutation(createUserAction, { form, successMessage: "User added" });
  const update = useServerMutation(updateUserAction, { form, successMessage: "User saved" });

  // The user's current role stays selectable even if it can't be granted by this admin.
  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: r.name,
    description: r.description ?? undefined,
  }));
  if (user?.roleId && !roles.some((r) => r.id === user.roleId)) {
    roleOptions.push({
      value: user.roleId,
      label: user.roleName ?? "Current role",
      description: undefined,
    });
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          user ? update.mutate({ ...values, id: user.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Person">
          <TextField control={form.control} name="firstName" label="First name" required />
          <TextField control={form.control} name="lastName" label="Last name" required />
          {editing ? (
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" value={user?.email} disabled readOnly />
              <p className="text-sm text-muted-foreground">The email can&apos;t be changed.</p>
            </div>
          ) : (
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="off"
            />
          )}
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            type="tel"
            placeholder="+232 76 123 456"
          />
          <ImageField
            control={form.control}
            name="avatarUrl"
            label="Photo"
            folder="users"
            shape="square"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Access"
          description={
            isMe ? "You can't change your own role or status." : "What this user can do."
          }
        >
          <SelectField
            control={form.control}
            name="roleId"
            label="Role"
            required
            placeholder="Choose a role…"
            options={roleOptions}
            disabled={isMe}
          />
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            required
            description="Blocked users can't sign in and are signed out at once."
            options={USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] }))}
            disabled={isMe}
          />
        </FormSection>

        <FormSection
          title={editing ? "Reset password" : "Password"}
          description={
            editing
              ? "Leave empty to keep the current password. Setting one signs the user out everywhere."
              : "The first password. Share it with the user securely; they can change it after signing in."
          }
        >
          <PasswordField
            control={form.control}
            name="password"
            label={editing ? "New password" : "Password"}
            required={!editing}
            autoComplete="new-password"
            description={PASSWORD_HINT}
          />
          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            required={!editing}
            autoComplete="new-password"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.users}
          pending={create.isPending || update.isPending}
          editing={editing}
          createLabel="Add user"
        />
      </form>
    </Form>
  );
}
