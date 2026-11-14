"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ImageField, TextField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerMutation } from "@/hooks/use-server-action";
import { useCurrentUser } from "@/providers/session-provider";
import { updateProfileAction } from "../actions";
import { profileSchema, type ProfileValues } from "../schemas";

/** Edit your own name, phone and photo. Email and role are shown, not editable. */
export function ProfileForm() {
  const me = useCurrentUser();
  const initial: ProfileValues = {
    firstName: me.firstName,
    lastName: me.lastName,
    phone: me.phone ?? "",
    avatarUrl: me.avatarUrl ?? "",
  };
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });
  const save = useServerMutation(updateProfileAction, {
    form,
    successMessage: "Profile saved",
    onSuccess: (_, values) => form.reset(values),
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
      >
        <ImageField
          control={form.control}
          name="avatarUrl"
          label="Photo"
          folder="avatars"
          shape="square"
          className="sm:col-span-2"
        />
        <TextField control={form.control} name="firstName" label="First name" required />
        <TextField control={form.control} name="lastName" label="Last name" required />
        <TextField control={form.control} name="phone" label="Phone" type="tel" />
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={me.email} disabled readOnly />
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={!form.formState.isDirty || save.isPending}
            onClick={() => form.reset()}
          >
            Discard changes
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
