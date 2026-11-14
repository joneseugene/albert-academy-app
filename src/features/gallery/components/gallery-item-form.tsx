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
import { createGalleryItemAction, updateGalleryItemAction } from "../actions";
import { galleryItemFormSchema, type GalleryItem, type GalleryItemFormValues } from "../schemas";

export function GalleryItemForm({ item }: { item?: GalleryItem }) {
  const initial: GalleryItemFormValues = {
    title: item?.title ?? "",
    description: item?.description ?? "",
    photoUrl: item?.photoUrl ?? "",
  };
  const form = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues: initial,
    values: item ? initial : undefined,
  });

  const create = useServerMutation(createGalleryItemAction, {
    form,
    successMessage: "Photo added",
  });
  const update = useServerMutation(updateGalleryItemAction, {
    form,
    successMessage: "Photo saved",
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          item ? update.mutate({ ...values, id: item.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Photo">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Photo"
            required
            folder="gallery"
            className="sm:col-span-2"
          />
          <TextField
            control={form.control}
            name="title"
            label="Title"
            required
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

        <FormFooter
          cancelHref={routes.gallery}
          pending={create.isPending || update.isPending}
          editing={Boolean(item)}
          createLabel="Add photo"
        />
      </form>
    </Form>
  );
}
