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
import { createNewsAction, updateNewsAction } from "../actions";
import {
  NEWS_STATUS_LABELS,
  NEWS_STATUSES,
  newsFormSchema,
  type News,
  type NewsFormValues,
} from "../schemas";

/** Create (no `news`) or edit an article. */
export function NewsForm({ news }: { news?: News }) {
  const initial: NewsFormValues = {
    title: news?.title ?? "",
    photoUrl: news?.photoUrl ?? "",
    summary: news?.summary ?? "",
    content: news?.content ?? "",
    status: news?.status ?? "draft",
    when: fromDateSpan(
      {
        precision: news?.eventPrecision ?? null,
        start: news?.eventStart ?? null,
        end: news?.eventEnd ?? null,
      },
      "none",
    ),
  };
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: initial,
    // Editing: stay in sync with the saved record (pages are kept alive between visits).
    values: news ? initial : undefined,
  });

  const create = useServerMutation(createNewsAction, { form, successMessage: "Article created" });
  const update = useServerMutation(updateNewsAction, { form, successMessage: "Article saved" });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          news ? update.mutate({ ...values, id: news.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Article">
          <TextField
            control={form.control}
            name="title"
            label="Title"
            required
            className="sm:col-span-2"
          />
          <RichTextField
            control={form.control}
            name="summary"
            label="Summary"
            description="One or two sentences shown in news lists."
            className="sm:col-span-2"
            variant="basic"
            maxLength={500}
          />
          <RichTextField
            control={form.control}
            name="content"
            label="Content"
            required
            className="sm:col-span-2"
            imageFolder="news"
          />
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            required
            description="Only published articles appear on the website."
            options={NEWS_STATUSES.map((s) => ({ value: s, label: NEWS_STATUS_LABELS[s] }))}
          />
          <DateSpanField
            control={form.control}
            name="when"
            label="When it happened"
            optional
            description="Optional. Shown on the website instead of the publish date, e.g. the day of the event, or just the year for older stories."
          />
        </FormSection>

        <FormSection title="Photo" description="The cover image for this article.">
          <ImageField
            control={form.control}
            name="photoUrl"
            label="Cover photo"
            folder="news"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormFooter
          cancelHref={routes.news}
          pending={create.isPending || update.isPending}
          editing={Boolean(news)}
          createLabel="Create article"
        />
      </form>
    </Form>
  );
}
