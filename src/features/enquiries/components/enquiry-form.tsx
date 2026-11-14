"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon } from "lucide-react";
import { useForm } from "react-hook-form";

import { SelectField, TextareaField, TextField } from "@/components/shared/form/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useServerMutation } from "@/hooks/use-server-action";
import { submitEnquiryAction } from "../actions";
import {
  ENQUIRY_MESSAGE_MAX,
  ENQUIRY_TOPICS,
  enquiryFormSchema,
  type EnquiryFormValues,
} from "../schemas";

const EMPTY: EnquiryFormValues = {
  name: "",
  email: "",
  phone: "",
  topic: "general",
  message: "",
  website: "",
};

/** Contact form on the public website; messages land in Admin → Enquiries. */
export function EnquiryForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: EMPTY,
  });
  const send = useServerMutation(submitEnquiryAction, {
    form,
    onSuccess: (_, values) => {
      setSentTo(values.email);
      form.reset(EMPTY);
    },
  });

  if (sentTo) {
    return (
      <div role="status" className="grid justify-items-start gap-3 py-6">
        <CheckCircle2Icon className="size-8 text-success" aria-hidden />
        <p className="font-serif text-2xl">Thank you. Your message has been sent.</p>
        <p className="text-sm text-muted-foreground">
          The school office will reply to <span className="text-foreground">{sentTo}</span>.
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setSentTo(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit((values) => send.mutate(values))}
      >
        <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <TextField
          control={form.control}
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
        />
        <SelectField
          control={form.control}
          name="topic"
          label="Topic"
          options={Object.entries(ENQUIRY_TOPICS).map(([value, label]) => ({ value, label }))}
        />
        <TextareaField
          control={form.control}
          name="message"
          label="Message"
          rows={5}
          maxLength={ENQUIRY_MESSAGE_MAX}
          className="sm:col-span-2"
        />
        {/* Spam trap: hidden from people, filled by bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <Button type="submit" disabled={send.isPending} className="h-10 px-6">
            {send.isPending ? "Sending…" : "Send message"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your details are only used to reply to you.
          </p>
        </div>
      </form>
    </Form>
  );
}
