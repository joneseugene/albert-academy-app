"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FormActions } from "../form/form-section";

/** Sticky Cancel / Save footer for create & edit pages. */
export function FormFooter({
  cancelHref,
  pending,
  editing,
  createLabel = "Create",
}: {
  cancelHref: string;
  pending: boolean;
  editing: boolean;
  createLabel?: string;
}) {
  return (
    <FormActions>
      <Button asChild variant="outline" type="button">
        <Link href={cancelHref}>Cancel</Link>
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save changes" : createLabel}
      </Button>
    </FormActions>
  );
}
