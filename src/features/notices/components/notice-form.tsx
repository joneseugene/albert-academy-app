"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { FormFooter } from "@/components/shared/crud/form-footer";
import { SwitchField, TextField } from "@/components/shared/form/fields";
import { FormSection } from "@/components/shared/form/form-section";
import { RichTextField } from "@/components/shared/rich-text/rich-text-field";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { createNoticeAction, updateNoticeAction } from "../actions";
import { noticeFormSchema, type Notice, type NoticeFormValues } from "../schemas";

/** Stored instant -> "YYYY-MM-DDTHH:mm" in school time (Freetown = GMT). */
const toLocal = (d: Date | null) => (d ? d.toISOString().slice(0, 16) : "");

export function NoticeForm({ notice }: { notice?: Notice }) {
  const initial: NoticeFormValues = {
    title: notice?.title ?? "",
    body: notice?.body ?? "",
    isPublished: notice?.isPublished ?? true,
    showBanner: notice?.showBanner ?? true,
    bannerFrom: toLocal(notice?.bannerFrom ?? null),
    bannerUntil: toLocal(notice?.bannerUntil ?? null),
  };
  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: initial,
    values: notice ? initial : undefined,
  });
  const c = form.control;
  const showBanner = useWatch({ control: c, name: "showBanner" });

  const create = useServerMutation(createNoticeAction, { form, successMessage: "Notice added" });
  const update = useServerMutation(updateNoticeAction, { form, successMessage: "Notice saved" });

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) =>
          notice ? update.mutate({ ...values, id: notice.id }) : create.mutate(values),
        )}
      >
        <FormSection title="Notice">
          <TextField control={c} name="title" label="Title" required className="sm:col-span-2" />
          <RichTextField
            control={c}
            name="body"
            label="Notice"
            required
            imageFolder="notices"
            className="sm:col-span-2"
          />
          <SwitchField
            control={c}
            name="isPublished"
            label="Published"
            description="Shown in Public Notices on the website."
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Pop-up banner"
          description="Show this notice as a pop-up when visitors open the website. Each visitor can choose “Don't show again”."
        >
          <SwitchField
            control={c}
            name="showBanner"
            label="Pop up when the website loads"
            className="sm:col-span-2"
          />
          {showBanner && (
            <>
              <TextField
                control={c}
                name="bannerFrom"
                label="From"
                type="datetime-local"
                description="Optional. School time (GMT). Empty: from now."
              />
              <TextField
                control={c}
                name="bannerUntil"
                label="Until"
                type="datetime-local"
                description="Optional. After this it stops popping up; the notice stays listed."
              />
            </>
          )}
        </FormSection>

        <FormFooter
          cancelHref={routes.notices}
          pending={create.isPending || update.isPending}
          editing={Boolean(notice)}
          createLabel="Add notice"
        />
      </form>
    </Form>
  );
}
