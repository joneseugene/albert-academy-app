"use client";

import { useState, type ReactNode } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import type { Permission, PermissionModule } from "@/config/permissions";
import { useServerMutation } from "@/hooks/use-server-action";
import type { ActionResult } from "@/lib/data/result";
import { ConfirmDialog } from "../confirm-dialog";
import type { RowAction } from "../data-view";

type Config<T> = {
  /** e.g. "/news" — edit links go to `${basePath}/${id}/edit`. */
  basePath: string;
  /** Permission module: edit needs `${module}.update`, delete `${module}.delete`. */
  module: PermissionModule;
  /** Server action that soft-deletes by id. */
  remove: (input: { id: string }) => Promise<ActionResult<unknown>>;
  /** Singular noun for messages, e.g. "article". */
  noun: string;
  getId: (row: T) => string;
  /** Shown in the confirmation, e.g. the title. */
  getLabel: (row: T) => string;
  /** Extra actions (shown before Edit). */
  extra?: RowAction<T>[];
};

/**
 * Standard row actions for content lists — Edit and Delete (with a
 * confirmation) — gated by the module's permissions. Deleting is a soft
 * delete: the record is hidden everywhere but kept in the database.
 */
export function useCrudActions<T>({
  basePath,
  module,
  remove,
  noun,
  getId,
  getLabel,
  extra = [],
}: Config<T>): { actions: RowAction<T>[]; dialogs: ReactNode; confirmDelete: (row: T) => void } {
  const [pending, setPending] = useState<T | null>(null);
  const del = useServerMutation(remove, {
    successMessage: `${noun.charAt(0).toUpperCase()}${noun.slice(1)} deleted`,
    onSuccess: () => setPending(null),
  });

  const actions: RowAction<T>[] = [
    ...extra,
    {
      id: "edit",
      label: "Edit",
      icon: PencilIcon,
      permission: `${module}.update` as Permission,
      href: (row) => `${basePath}/${getId(row)}/edit`,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2Icon,
      permission: `${module}.delete` as Permission,
      destructive: true,
      separatorBefore: true,
      onSelect: (row) => setPending(row),
    },
  ];

  const dialogs = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => !open && setPending(null)}
      title={`Delete ${noun}?`}
      description={
        pending ? `"${getLabel(pending)}" will be removed from the website and this console.` : ""
      }
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      destructive
      pending={del.isPending}
      onConfirm={() => pending && del.mutate({ id: getId(pending) })}
    />
  );

  return { actions, dialogs, confirmDelete: setPending };
}
