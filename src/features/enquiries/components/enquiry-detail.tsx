"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheckIcon, MailIcon, PhoneIcon, ReplyIcon, Trash2Icon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import { formatDateTime } from "@/lib/format";
import { usePermission } from "@/providers/session-provider";
import { deleteEnquiryAction, setEnquiryStatusAction } from "../actions";
import { ENQUIRY_STATUSES, topicLabel, type Enquiry } from "../schemas";
import { replyHref } from "./reply-href";

export function EnquiryDetail({ enquiry: e }: { enquiry: Enquiry }) {
  const router = useRouter();
  const canUpdate = usePermission("enquiries.update");
  const canDelete = usePermission("enquiries.delete");
  const [confirm, setConfirm] = useState(false);
  const setStatus = useServerMutation(setEnquiryStatusAction, {
    successMessage: (_, { status }) =>
      status === "replied" ? "Marked as replied" : "Marked as unread",
  });
  const remove = useServerMutation(deleteEnquiryAction, {
    successMessage: "Enquiry deleted",
    onSuccess: () => router.push(routes.enquiries),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <article className="grid content-start gap-5 rounded-xl border bg-card p-5 sm:p-6">
        <header className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={e.status} label={ENQUIRY_STATUSES[e.status]} />
            <span className="text-xs text-muted-foreground">{topicLabel(e.topic)}</span>
          </div>
          <h2 className="text-lg font-semibold">{e.name}</h2>
          <p className="text-sm text-muted-foreground">Received {formatDateTime(e.createdAt)}</p>
        </header>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.message}</p>
      </article>

      <aside className="grid content-start gap-3">
        <div className="grid gap-2 rounded-xl border p-4 text-sm">
          <a
            href={`mailto:${e.email}`}
            className="flex items-center gap-2 break-all hover:text-primary"
          >
            <MailIcon className="size-4 shrink-0 text-muted-foreground" /> {e.email}
          </a>
          {e.phone && (
            <a
              href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 hover:text-primary"
            >
              <PhoneIcon className="size-4 shrink-0 text-muted-foreground" /> {e.phone}
            </a>
          )}
        </div>
        <Button asChild>
          <a href={replyHref(e)}>
            <ReplyIcon /> Reply by email
          </a>
        </Button>
        {canUpdate &&
          (e.status === "replied" ? (
            <Button
              variant="outline"
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: e.id, status: "new" })}
            >
              <MailIcon /> Mark as unread
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: e.id, status: "replied" })}
            >
              <MailCheckIcon /> Mark as replied
            </Button>
          ))}
        {canDelete && (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirm(true)}
          >
            <Trash2Icon /> Delete
          </Button>
        )}
      </aside>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this enquiry?"
        description={`The message from ${e.name} will be removed from the inbox.`}
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: e.id })}
      />
    </div>
  );
}
