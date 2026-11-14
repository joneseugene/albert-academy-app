"use client";

import type { ReactNode } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  useFieldArray,
  type ArrayPath,
  type Control,
  type FieldArray,
  type FieldValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";

/**
 * A repeatable group of fields (contacts, social links, values…) on top of
 * RHF's useFieldArray. `renderRow(index)` renders one row's fields; Add and
 * Remove are handled here.
 */
export function ListField<T extends FieldValues, N extends ArrayPath<T>>({
  control,
  name,
  emptyRow,
  addLabel,
  emptyText,
  renderRow,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: N;
  emptyRow: FieldArray<T, N>;
  addLabel: string;
  emptyText: string;
  renderRow: (index: number) => ReactNode;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="grid gap-3 sm:col-span-2">
      {fields.length === 0 && (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2 rounded-md border p-3">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
            {renderRow(index)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Remove"
            disabled={disabled}
            onClick={() => remove(index)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        disabled={disabled}
        onClick={() => append(emptyRow)}
      >
        <PlusIcon /> {addLabel}
      </Button>
    </div>
  );
}
