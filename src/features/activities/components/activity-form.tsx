"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { DateSpanField } from "@/components/shared/form/date-span-field";
import { ImageField, SelectField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { fromDateSpan } from "@/lib/date-span";
import { createActivityAction, updateActivityAction } from "../actions";
import {
  ACTIVITY_CATEGORIES,
  activityFormSchema,
  type Activity,
  type ActivityCategory,
  type ActivityFormValues,
} from "../schemas";

export function ActivityForm({ activity }: { activity?: Activity }) {
  const initial: ActivityFormValues = {
    title: activity?.title ?? "",
    category: (activity?.category as ActivityCategory) ?? ("" as ActivityCategory),
    description: activity?.description ?? "",
    photoUrl: activity?.photoUrl ?? "",
    when: activity
      ? fromDateSpan({
          precision: activity.datePrecision,
          start: activity.startDate,
          end: activity.endDate,
        })
      : { mode: "date", start: "", end: "" },
  };
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: initial,
    values: activity ? initial : undefined,
  });

  const create = useServerMutation(createActivityAction, {
    form,
    successMessage: "Activity added",
  });
  const update = useServerMutation(updateActivityAction, {
    form,
    successMessage: "Activity saved",
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          activity ? update.mutate({ ...values, id: activity.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Activity">
          <TextField
            control={form.control}
            name="title"
            label="Title"
            required
            className="sm:col-span-2"
          />
          <SelectField
            control={form.control}
            name="category"
            label="Category"
            required
            placeholder="Choose a category…"
            options={Object.entries(ACTIVITY_CATEGORIES).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <div className="hidden sm:block" />
          <DateSpanField
            control={form.control}
            name="when"
            label="When"
            required
            description="As precise as you know it: one day, several days, a year or several years."
          />
          <RichTextField
            control={form.control}
            name="description"
            label="Description"
            className="sm:col-span-2"
            imageFolder="activities"
            maxLength={5000}
          />
        </FormSection>

        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Photo"
            folder="activities"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.activities}
          pending={create.isPending || update.isPending}
          editing={Boolean(activity)}
          createLabel="Add activity"
        />
      </form>
    </Form>
  );
}
