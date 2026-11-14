import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { Permission } from "@/config/permissions";
import type { Option } from "../options";

/** A column in table view; also feeds the card view on small screens. */
export type DataColumn<T> = {
  /** Unique id. When `sortable`, it's also the field name sent as `sort`. */
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  /** Applied to <th>/<td>. */
  className?: string;
  /** Omit from the card body (e.g. already used as the card title). */
  hideInCard?: boolean;
};

/** How a row renders as a card below the `md` breakpoint. */
export type CardLayout<T> = {
  title: (row: T) => ReactNode;
  subtitle?: (row: T) => ReactNode;
  /** Top-right badge (status…). */
  badge?: (row: T) => ReactNode;
  /** Column ids shown as label/value pairs. Default: every column not `hideInCard`. */
  fields?: string[];
};

/** A per-row action (view, edit, delete…). Display is configurable per row and permission. */
export type RowAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Navigate… */
  href?: (row: T) => string;
  /** …or run a handler (e.g. open a confirm dialog). */
  onSelect?: (row: T) => void;
  destructive?: boolean;
  /** Hidden unless the user holds this permission. */
  permission?: Permission;
  /** Hidden for rows where this returns true (e.g. "Reactivate" on active users). */
  hidden?: (row: T) => boolean;
  separatorBefore?: boolean;
};

/** A single-choice filter synced to the URL as `?{id}=value`. */
export type FilterDef = {
  id: string;
  label: string;
  options: Option[];
  searchable?: boolean;
};
