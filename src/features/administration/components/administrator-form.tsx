"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, NumberField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { createAdministratorAction, updateAdministratorAction } from "../actions";
import {
  administratorFormSchema,
  type Administrator,
  type AdministratorFormValues,
} from "../schemas";

export function AdministratorForm({ administrator }: { administrator?: Administrator }) {
  const initial: AdministratorFormValues = {
    name: administrator?.name ?? "",
    position: administrator?.position ?? "",
    photoUrl: administrator?.photoUrl ?? "",
    sortOrder: administrator?.sortOrder ?? 0,
  };
  const form = useForm<AdministratorFormValues>({
    resolver: zodResolver(administratorFormSchema),
    defaultValues: initial,
    values: administrator ? initial : undefined,
  });

  const create = useServerMutation(createAdministratorAction, {
    form,
    successMessage: "Staff member added",
  });
  const update = useServerMutation(updateAdministratorAction, {
    form,
    successMessage: "Staff member saved",
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          administrator
            ? update.mutate({ ...values, id: administrator.id })
            : create.mutate(values),
        )}
      >
        <FormSection title="Staff member">
          <TextField control={form.control} name="name" label="Full name" required />
          <TextField
            control={form.control}
            name="position"
            label="Position"
            required
            placeholder="e.g. Vice Principal (Academics)"
          />
          <NumberField
            control={form.control}
            name="sortOrder"
            label="Display order"
            description="Lower numbers are shown first."
            min={0}
          />
        </FormSection>

        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Photo"
            folder="administration"
            shape="portrait"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.administration}
          pending={create.isPending || update.isPending}
          editing={Boolean(administrator)}
          createLabel="Add staff member"
        />
      </form>
    </Form>
  );
}
