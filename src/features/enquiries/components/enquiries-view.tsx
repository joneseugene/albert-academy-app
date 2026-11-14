"use client";

import { MailCheckIcon, MailIcon, ReplyIcon } from "lucide-react";

import { useCrudActions } from "@/components/shared/crud/use-crud-actions";
import { DataView, type DataColumn } from "@/components/shared/data-view";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { routes } from "@/config/routes";
import { useServerMutation } from "@/hooks/use-server-action";
import type { Paginated } from "@/lib/data/query";
import { cn } from "@/lib/utils";
import { deleteEnquiryAction, setEnquiryStatusAction } from "../actions";
import { ENQUIRY_STATUSES, ENQUIRY_TOPICS, topicLabel, type Enquiry } from "../schemas";
import { replyHref } from "./reply-href";

const badge = (e: Enquiry) => <StatusBadge status={e.status} label={ENQUIRY_STATUSES[e.status]} />;

const columns: DataColumn<Enquiry>[] = [
  {
    id: "name",
    header: "From",
    sortable: true,
    hideInCard: true,
    cell: (e) => (
      <span className="grid">
        <span className={cn("truncate", e.status === "new" && "font-semibold")}>{e.name}</span>
        <span className="truncate text-xs text-muted-foreground">{e.email}</span>
      </span>
    ),
  },
  { id: "topic", header: "Topic", sortable: true, cell: (e) => topicLabel(e.topic) },
  {
    id: "message",
    header: "Message",
    hideInCard: true,
    cell: (e) => <span className="line-clamp-1 max-w-sm text-muted-foreground">{e.message}</span>,
  },
  { id: "status", header: "Status", sortable: true, hideInCard: true, cell: badge },
  {
    id: "createdAt",
    header: "Received",
    sortable: true,
    cell: (e) => <RelativeTime value={e.createdAt} />,
  },
];

export function EnquiriesView({ data }: { data: Paginated<Enquiry> }) {
  const setStatus = useServerMutation(setEnquiryStatusAction, {
    successMessage: (_, { status }) =>
      status === "replied"
        ? "Marked as replied"
        : status === "new"
          ? "Marked as unread"
          : "Marked as read",
  });

  const { actions, dialogs } = useCrudActions<Enquiry>({
    basePath: routes.enquiries,
    module: "enquiries",
    remove: deleteEnquiryAction,
    noun: "enquiry",
    getId: (e) => e.id,
    getLabel: (e) => `${e.name} (${topicLabel(e.topic)})`,
    extra: [
      {
        id: "reply",
        label: "Reply by email",
        icon: ReplyIcon,
        permission: "enquiries.read",
        onSelect: (e) => {
          window.location.href = replyHref(e);
        },
      },
      {
        id: "replied",
        label: "Mark as replied",
        icon: MailCheckIcon,
        permission: "enquiries.update",
        hidden: (e) => e.status === "replied",
        onSelect: (e) => setStatus.mutate({ id: e.id, status: "replied" }),
      },
      {
        id: "unread",
        label: "Mark as unread",
        icon: MailIcon,
        permission: "enquiries.update",
        hidden: (e) => e.status === "new",
        onSelect: (e) => setStatus.mutate({ id: e.id, status: "new" }),
      },
    ],
  });
  // Enquiries are read and answered, never edited: drop the generic "Edit".
  const rowActions = actions.filter((a) => a.id !== "edit");

  return (
    <>
      <DataView
        data={data}
        columns={columns}
        card={{
          title: (e) => <span className={cn(e.status === "new" && "font-semibold")}>{e.name}</span>,
          subtitle: (e) => e.message,
          badge,
        }}
        getRowId={(e) => e.id}
        rowHref={(e) => `${routes.enquiries}/${e.id}`}
        actions={rowActions}
        searchPlaceholder="Search name, email or message…"
        filters={[
          {
            id: "status",
            label: "Status",
            options: Object.entries(ENQUIRY_STATUSES).map(([value, label]) => ({ value, label })),
          },
          {
            id: "topic",
            label: "Topic",
            options: Object.entries(ENQUIRY_TOPICS).map(([value, label]) => ({ value, label })),
          },
        ]}
        emptyTitle="No enquiries yet"
        emptyDescription="Messages sent from the contact form on the website appear here."
      />
      {dialogs}
    </>
  );
}
