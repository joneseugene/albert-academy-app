"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterXIcon,
  MoreVerticalIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Paginated } from "@/lib/data/query";
import { listSearchParams, parseSort, serializeSort } from "@/lib/data/search-params";
import { hasPermission } from "@/lib/auth/access";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/providers/session-provider";
import { RefreshButton } from "../refresh-button";
import { SelectInput } from "../select-input";
import type { CardLayout, DataColumn, FilterDef, RowAction } from "./types";

const ALL = "__all";
const PAGE_SIZES = [10, 20, 50, 100];

export type DataViewProps<T> = {
  data: Paginated<T>;
  columns: DataColumn<T>[];
  card: CardLayout<T>;
  getRowId: (row: T) => string;
  actions?: RowAction<T>[];
  filters?: FilterDef[];
  searchPlaceholder?: string;
  /** Makes card titles / the first column link to the row's page. */
  rowHref?: (row: T) => string;
  /** Extra toolbar content (e.g. a "New" button). */
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

/**
 * Server-paginated list: table on md+ screens, cards below. Search, filters,
 * sort and page live in the URL (shallow: false), so the Server Component
 * re-fetches through its service on every change.
 */
export function DataView<T>({
  data,
  columns,
  card,
  getRowId,
  actions = [],
  filters = [],
  searchPlaceholder = "Search…",
  rowHref,
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription,
}: DataViewProps<T>) {
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  // Keyed on the ids (not the array), so parsers stay stable across renders.
  const filterKey = filters.map((f) => f.id).join(",");
  const parsers = useMemo(
    () => ({
      ...listSearchParams,
      ...Object.fromEntries(
        filterKey
          .split(",")
          .filter(Boolean)
          .map((id) => [id, parseAsString.withDefault("")]),
      ),
    }),
    [filterKey],
  );
  const [params, setParams] = useQueryStates(parsers, { shallow: false, startTransition });
  const [search, setSearch] = useState(params.search);

  const visibleActions = actions.filter((a) => !a.permission || hasPermission(user, a.permission));
  const sort = parseSort(params.sort)[0];
  const activeFilters = filters.filter((f) => params[f.id as keyof typeof params]);
  const hasQuery = Boolean(params.search) || activeFilters.length > 0;

  const toggleSort = (field: string) => {
    const next =
      sort?.field !== field
        ? [{ field, direction: "asc" as const }]
        : sort.direction === "asc"
          ? [{ field, direction: "desc" as const }]
          : [];
    setParams({ sort: serializeSort(next), page: 1 });
  };

  const clearAll = () => {
    setSearch("");
    setParams({
      search: "",
      page: 1,
      ...Object.fromEntries(filters.map((f) => [f.id, ""])),
    });
  };

  const titleCell = (row: T, content: ReactNode) =>
    rowHref ? (
      <Link href={rowHref(row)} className="font-medium hover:underline">
        {content}
      </Link>
    ) : (
      content
    );

  const rowActions = (row: T) => {
    const items = visibleActions.filter((a) => !a.hidden?.(row));
    if (!items.length) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {items.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                {Icon && <Icon />}
                {action.label}
              </>
            );
            return (
              <div key={action.id}>
                {action.separatorBefore && <DropdownMenuSeparator />}
                {action.href ? (
                  <DropdownMenuItem
                    asChild
                    variant={action.destructive ? "destructive" : "default"}
                  >
                    <Link href={action.href(row)}>{content}</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant={action.destructive ? "destructive" : "default"}
                    onSelect={() => action.onSelect?.(row)}
                  >
                    {content}
                  </DropdownMenuItem>
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const cardFields = card.fields
    ? columns.filter((c) => card.fields!.includes(c.id))
    : columns.filter((c) => !c.hideInCard);

  const from = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  /** Row number across pages (row 1 on page 2 of 20/page is #21). */
  const rowNumber = (index: number) => formatNumber(from + index);
  const to = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative sm:w-72">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-9"
              onChange={(e) => {
                setSearch(e.target.value);
                setParams(
                  { search: e.target.value, page: 1 },
                  { limitUrlUpdates: { method: "debounce", timeMs: 350 } },
                );
              }}
            />
          </div>
          {filters.map((filter) => {
            const value = (params[filter.id as keyof typeof params] as string) || ALL;
            const options = [
              { value: ALL, label: `All ${filter.label.toLowerCase()}` },
              ...filter.options,
            ];
            return (
              <div key={filter.id} className="sm:w-48">
                <SelectInput
                  aria-describedby={undefined}
                  options={options}
                  value={value}
                  searchable={filter.searchable}
                  placeholder={filter.label}
                  onChange={(v) => setParams({ [filter.id]: v === ALL ? "" : v, page: 1 })}
                />
              </div>
            );
          })}
          {hasQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="self-start sm:self-auto"
            >
              <FilterXIcon /> Clear
            </Button>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <RefreshButton />
          {toolbar}
        </div>
      </div>

      <div className={cn("transition-opacity", isPending && "pointer-events-none opacity-60")}>
        {data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
            <SearchXIcon className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">{hasQuery ? "No matching results" : emptyTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {hasQuery ? "Try a different search or clear the filters." : emptyDescription}
            </p>
            {hasQuery && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table — md and up */}
            <div className="hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-right tabular-nums">#</TableHead>
                    {columns.map((col) => (
                      <TableHead
                        key={col.id}
                        className={col.className}
                        aria-sort={
                          !col.sortable
                            ? undefined
                            : sort?.field === col.id
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                        }
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.id)}
                            className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
                          >
                            {col.header}
                            {sort?.field === col.id ? (
                              sort.direction === "asc" ? (
                                <ArrowUpIcon className="size-3.5" />
                              ) : (
                                <ArrowDownIcon className="size-3.5" />
                              )
                            ) : (
                              <ArrowUpDownIcon className="size-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </TableHead>
                    ))}
                    {visibleActions.length > 0 && (
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row, index) => (
                    <TableRow key={getRowId(row)}>
                      <TableCell className="w-12 text-right text-muted-foreground tabular-nums">
                        {rowNumber(index)}
                      </TableCell>
                      {columns.map((col, i) => (
                        <TableCell key={col.id} className={col.className}>
                          {i === 0 ? titleCell(row, col.cell(row)) : col.cell(row)}
                        </TableCell>
                      ))}
                      {visibleActions.length > 0 && (
                        <TableCell className="text-right">{rowActions(row)}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cards — below md */}
            <ul className="grid gap-3 md:hidden">
              {data.items.map((row, index) => (
                <li key={getRowId(row)}>
                  <Card className="gap-3 py-4">
                    <CardHeader className="flex flex-row items-start justify-between gap-2 px-4">
                      <span className="mt-0.5 shrink-0 text-sm text-muted-foreground tabular-nums">
                        {rowNumber(index)}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{titleCell(row, card.title(row))}</div>
                        {card.subtitle && (
                          <div className="truncate text-sm text-muted-foreground">
                            {card.subtitle(row)}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {card.badge?.(row)}
                        {rowActions(row)}
                      </div>
                    </CardHeader>
                    {cardFields.length > 0 && (
                      <CardContent className="px-4">
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          {cardFields.map((col) => (
                            <div key={col.id} className="min-w-0">
                              <dt className="text-xs text-muted-foreground">{col.header}</dt>
                              <dd className="truncate">{col.cell(row)}</dd>
                            </div>
                          ))}
                        </dl>
                      </CardContent>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col-reverse items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <span>
          {data.total === 0
            ? "No results"
            : `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(data.total)}`}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(data.pageSize)}
            onValueChange={(v) => setParams({ pageSize: Number(v), page: 1 })}
          >
            <SelectTrigger size="sm" className="w-30" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="tabular-nums">
            {data.page} / {data.pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={data.page <= 1 || isPending}
            onClick={() => setParams({ page: data.page - 1 })}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={data.page >= data.pageCount || isPending}
            onClick={() => setParams({ page: data.page + 1 })}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
