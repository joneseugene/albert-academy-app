"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LightbulbIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { NumberField, SwitchField, TextareaField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils";
import { createFactAction, updateFactAction } from "../actions";
import { FACT_MAX_LENGTH, factFormSchema, type Fact, type FactFormValues } from "../schemas";

export function FactForm({ fact }: { fact?: Fact }) {
  const initial: FactFormValues = {
    fact: fact?.fact ?? "",
    isPublished: fact?.isPublished ?? true,
    sortOrder: fact?.sortOrder ?? 0,
  };
  const form = useForm<FactFormValues>({
    resolver: zodResolver(factFormSchema),
    defaultValues: initial,
    values: fact ? initial : undefined,
  });
  const text = useWatch({ control: form.control, name: "fact" }) ?? "";
  const remaining = FACT_MAX_LENGTH - text.trim().length;

  const create = useServerMutation(createFactAction, { form, successMessage: "Fact added" });
  const update = useServerMutation(updateFactAction, { form, successMessage: "Fact saved" });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          fact ? update.mutate({ ...values, id: fact.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Fact" description="One short, interesting fact about the school.">
          <TextareaField
            control={form.control}
            name="fact"
            label="Did you know…"
            required
            rows={4}
            placeholder="…that Albert Academy is one of the oldest secondary schools in Sierra Leone?"
            className="sm:col-span-2"
            description={
              <span className={cn("tabular-nums", remaining < 0 && "text-destructive")}>
                {remaining >= 0
                  ? `${remaining} characters left`
                  : `${-remaining} characters over the limit`}
              </span>
            }
          />
          <SwitchField
            control={form.control}
            name="isPublished"
            label="Show on the website"
            description="Hidden facts are kept here but not shown publicly."
          />
          <NumberField
            control={form.control}
            name="sortOrder"
            label="Display order"
            description="Lower numbers are shown first."
            min={0}
          />
        </FormSection>

        {text.trim() && (
          <section aria-label="Preview" className="rounded-xl border bg-accent/40 p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <LightbulbIcon className="size-4" aria-hidden /> Did you know?
            </p>
            <p className="text-sm leading-relaxed">{text.trim()}</p>
          </section>
        )}

        <FormFooter
          cancelHref={routes.facts}
          pending={create.isPending || update.isPending}
          editing={Boolean(fact)}
          createLabel="Add fact"
        />
      </form>
    </Form>
  );
}
