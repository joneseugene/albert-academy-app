"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { ImageField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { createResourceAction, updateResourceAction } from "../actions";
import { resourceFormSchema, type AcademicResource, type ResourceFormValues } from "../schemas";

export function ResourceForm({ resource }: { resource?: AcademicResource }) {
  const initial: ResourceFormValues = {
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    url: resource?.url ?? "",
    photoUrl: resource?.photoUrl ?? "",
  };
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: initial,
    values: resource ? initial : undefined,
  });

  const create = useServerMutation(createResourceAction, {
    form,
    successMessage: "Resource added",
  });
  const update = useServerMutation(updateResourceAction, {
    form,
    successMessage: "Resource saved",
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          resource ? update.mutate({ ...values, id: resource.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Resource">
          <TextField
            control={form.control}
            name="title"
            label="Title"
            required
            className="sm:col-span-2"
          />
          <TextField
            control={form.control}
            name="url"
            label="Link (URL)"
            type="url"
            required
            placeholder="https://"
            className="sm:col-span-2"
          />
          <RichTextField
            control={form.control}
            name="description"
            label="Description"
            className="sm:col-span-2"
            variant="basic"
            maxLength={2000}
          />
        </FormSection>

        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Cover image"
            folder="resources"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.resources}
          pending={create.isPending || update.isPending}
          editing={Boolean(resource)}
          createLabel="Add resource"
        />
      </form>
    </Form>
  );
}
