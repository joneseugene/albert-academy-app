"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { groupOptions, type Option } from "./options";

export type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Adds a search box. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Collapse to "N selected" beyond this many chips. */
  maxChips?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Multi select with chips; optional search; options may be grouped. */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable = true,
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  maxChips = 3,
  disabled,
  className,
  ...aria
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = new Set(value);
  const byValue = new Map(options.map((o) => [o.value, o]));
  const groups = groupOptions(options);

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange([...next]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-auto min-h-9 w-full justify-between font-normal dark:bg-input/30",
            className,
          )}
          {...aria}
        >
          <span className="flex flex-wrap gap-1">
            {value.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {value.length > maxChips ? (
              <Badge variant="secondary">{value.length} selected</Badge>
            ) : (
              value.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1 pr-1">
                  {byValue.get(v)?.label ?? v}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${byValue.get(v)?.label ?? v}`}
                    className="rounded-sm opacity-60 hover:opacity-100"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(v);
                    }}
                  >
                    <XIcon className="size-3" />
                  </span>
                </Badge>
              ))
            )}
          </span>
          <ChevronsUpDownIcon className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command>
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map(({ group, options: items }) => (
              <CommandGroup key={group ?? "_"} heading={group}>
                {items.map((o) => {
                  const isSelected = selected.has(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={`${o.label} ${o.value} ${o.group ?? ""}`}
                      disabled={o.disabled}
                      onSelect={() => toggle(o.value)}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input",
                        )}
                      >
                        {isSelected && <CheckIcon className="size-3 text-current" />}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{o.label}</span>
                        {o.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {o.description}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
