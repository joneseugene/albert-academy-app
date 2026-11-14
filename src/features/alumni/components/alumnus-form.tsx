"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, NumberField, SwitchField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { createAlumnusAction, updateAlumnusAction } from "../actions";
import { alumnusFormSchema, type Alumnus, type AlumnusFormValues } from "../schemas";

export function AlumnusForm({ alumnus }: { alumnus?: Alumnus }) {
  const initial: AlumnusFormValues = {
    name: alumnus?.name ?? "",
    nickname: alumnus?.nickname ?? "",
    classYear: alumnus?.classYear ?? "",
    position: alumnus?.position ?? "",
    summary: alumnus?.summary ?? "",
    detail: alumnus?.detail ?? "",
    photoUrl: alumnus?.photoUrl ?? "",
    sortOrder: alumnus?.sortOrder ?? 0,
    isDeceased: alumnus?.isDeceased ?? false,
    deathYear: alumnus?.deathYear ?? null,
  };
  const form = useForm<AlumnusFormValues>({
    resolver: zodResolver(alumnusFormSchema),
    defaultValues: initial,
    values: alumnus ? initial : undefined,
  });

  const isDeceased = useWatch({ control: form.control, name: "isDeceased" });

  const create = useServerMutation(createAlumnusAction, { form, successMessage: "Alumnus added" });
  const update = useServerMutation(updateAlumnusAction, { form, successMessage: "Alumnus saved" });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          alumnus ? update.mutate({ ...values, id: alumnus.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Person">
          <TextField control={form.control} name="name" label="Full name" required />
          <TextField control={form.control} name="nickname" label="Nickname" />
          <TextField
            control={form.control}
            name="classYear"
            label="Class"
            placeholder="e.g. 2009/2010"
            description="Leave empty if not known."
          />
          <TextField
            control={form.control}
            name="position"
            label="Position"
            placeholder="e.g. Former Vice President of Sierra Leone"
          />
          <NumberField
            control={form.control}
            name="sortOrder"
            label="Display order"
            description="Lower numbers are shown first."
            min={0}
          />
          <SwitchField
            control={form.control}
            name="isDeceased"
            label="Late (deceased)"
            description="Their photos show in grey scale on the website."
          />
          {isDeceased && (
            <NumberField
              control={form.control}
              name="deathYear"
              label="Year of death"
              description="Optional."
              nullable
              min={1800}
              max={2100}
              placeholder="e.g. 1998"
            />
          )}
        </FormSection>

        <FormSection title="Story">
          <RichTextField
            control={form.control}
            name="summary"
            label="Summary"
            description="A short line shown on cards."
            className="sm:col-span-2"
            variant="basic"
            maxLength={600}
          />
          <RichTextField
            control={form.control}
            name="detail"
            label="Detail"
            description="The full story shown on their page."
            className="sm:col-span-2"
            imageFolder="alumni"
            maxLength={20000}
          />
        </FormSection>

        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Photo"
            folder="alumni"
            shape="portrait"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.alumni}
          pending={create.isPending || update.isPending}
          editing={Boolean(alumnus)}
          createLabel="Add alumnus"
        />
      </form>
    </Form>
  );
}
