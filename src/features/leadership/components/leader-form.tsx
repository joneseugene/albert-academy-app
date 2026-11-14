"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, NumberField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { createLeaderAction, updateLeaderAction } from "../actions";
import {
  leaderFormSchema,
  type Leader,
  type LeaderFormOutput,
  type LeaderFormValues,
} from "../schemas";

export function LeaderForm({ leader }: { leader?: Leader }) {
  const initial: LeaderFormValues = {
    name: leader?.name ?? "",
    title: leader?.title ?? "Principal",
    photoUrl: leader?.photoUrl ?? "",
    fromYear: leader?.fromYear ?? (undefined as unknown as number),
    toYear: leader?.toYear ?? null,
    summary: leader?.summary ?? "",
  };
  const form = useForm<LeaderFormValues, unknown, LeaderFormOutput>({
    resolver: zodResolver(leaderFormSchema),
    defaultValues: initial,
    values: leader ? initial : undefined,
  });

  const create = useServerMutation(createLeaderAction, { form, successMessage: "Leader added" });
  const update = useServerMutation(updateLeaderAction, { form, successMessage: "Leader saved" });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          leader ? update.mutate({ ...values, id: leader.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Leader">
          <TextField control={form.control} name="name" label="Full name" required />
          <TextField
            control={form.control}
            name="title"
            label="Title"
            required
            placeholder="Principal"
          />
          <NumberField
            control={form.control}
            name="fromYear"
            label="From (year)"
            required
            placeholder="e.g. 2015"
          />
          <NumberField
            control={form.control}
            name="toYear"
            label="To (year)"
            nullable
            placeholder="Leave empty if in office"
            description="Leave empty for the current leader."
          />
          <RichTextField
            control={form.control}
            name="summary"
            label="Summary"
            className="sm:col-span-2"
            variant="basic"
            maxLength={2000}
          />
        </FormSection>

        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Photo"
            folder="leadership"
            shape="portrait"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.leadership}
          pending={create.isPending || update.isPending}
          editing={Boolean(leader)}
          createLabel="Add leader"
        />
      </form>
    </Form>
  );
}
