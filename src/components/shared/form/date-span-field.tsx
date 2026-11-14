"use client";

import type { ReactNode } from "react";
import {
  useFormContext,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DATE_MODES, type DateSpanValue } from "@/lib/date-span";
import { cn } from "@/lib/utils";

/**
 * "When": the admin picks how precise it is — single date, date range, year
 * or year range (plus "No date" with `optional`) — then fills one or two inputs.
 * Bind to a `dateSpanSchema()` object field.
 *
 *   <DateSpanField control={c} name="when" label="When" required />
 */
export function DateSpanField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  optional,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: N;
  label: string;
  description?: ReactNode;
  required?: boolean;
  /** Offer "No date". */
  optional?: boolean;
  className?: string;
}) {
  const path = (key: keyof DateSpanValue) => `${name}.${key}` as FieldPath<T>;
  const mode = useWatch({ control, name: path("mode") }) as DateSpanValue["mode"];
  const years = mode === "year" || mode === "year-range";
  const ranged = mode === "range" || mode === "year-range";
  const modes = [
    ...(optional ? ([["none", "No date"]] as const) : []),
    ...Object.entries(DATE_MODES),
  ] as Array<[DateSpanValue["mode"], string]>;

  // Carry what was typed across modes: 2026-03-12 -> 2026; a year -> no date (pick one).
  const { getValues, setValue, clearErrors } = useFormContext<T>();
  const switchMode = (next: DateSpanValue["mode"], onChange: (v: unknown) => void) => {
    const toYears = next === "year" || next === "year-range";
    if (toYears !== years) {
      for (const key of ["start", "end"] as const) {
        const value = String(getValues(path(key)) ?? "");
        const converted = toYears ? value.slice(0, 4) : "";
        setValue(path(key), converted as never, { shouldDirty: true });
      }
    }
    clearErrors(name);
    onChange(next);
  };

  const input = (key: "start" | "end", inputLabel: string) => (
    <FormField
      control={control}
      name={path(key)}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-normal text-muted-foreground">{inputLabel}</FormLabel>
          <FormControl>
            {years ? (
              <Input
                {...field}
                value={field.value ?? ""}
                inputMode="numeric"
                maxLength={4}
                placeholder="e.g. 2019"
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
              />
            ) : (
              <Input {...field} value={field.value ?? ""} type="date" />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <FormField
      control={control}
      name={path("mode")}
      render={({ field }) => (
        <FormItem className={cn("sm:col-span-2", className)}>
          <FormLabel>
            {label}
            {required && (
              <span className="text-destructive" aria-hidden>
                *
              </span>
            )}
          </FormLabel>
          <FormControl>
            <div
              role="radiogroup"
              aria-label={`${label}: precision`}
              className="flex w-fit max-w-full flex-wrap gap-1 rounded-lg border bg-muted/40 p-1"
            >
              {modes.map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === value}
                  disabled={field.disabled}
                  onClick={() => switchMode(value, field.onChange)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                    field.value === value
                      ? "bg-background text-foreground ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {text}
                </button>
              ))}
            </div>
          </FormControl>
          {mode !== "none" && (
            <div className="grid gap-3 sm:max-w-md sm:grid-cols-2">
              {input("start", ranged ? (years ? "From year" : "From") : years ? "Year" : "Date")}
              {ranged && input("end", years ? "To year" : "To")}
            </div>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
