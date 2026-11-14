"use client";

import type { ComponentProps, ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImagePicker, type ImageFolder } from "../image-picker";
import { MultiSelect, type MultiSelectProps } from "../multi-select";
import { PasswordInput } from "../password-input";
import { SelectInput, type SelectInputProps } from "../select-input";

/**
 * Form fields wired to react-hook-form + shadcn Form (label, aria, errors).
 *
 *   <TextField control={form.control} name="title" label="Title" required />
 */
type BaseProps<T extends FieldValues, N extends FieldPath<T>> = {
  // Any transformed (output) type: fields only read/write the input values.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: N;
  label: string;
  description?: ReactNode;
  /** Shows an asterisk; validation itself comes from the zod schema. */
  required?: boolean;
  className?: string;
};

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <FormLabel>
      {label}
      {required && (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      )}
    </FormLabel>
  );
}

export function TextField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...input
}: BaseProps<T, N> & Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <Input {...input} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function PasswordField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...input
}: BaseProps<T, N> & Omit<ComponentProps<typeof PasswordInput>, "name" | "value" | "onChange">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <PasswordInput {...input} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...input
}: BaseProps<T, N> & Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <Textarea {...input} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Numeric input; empty input becomes `undefined` (or `null` with `nullable`). */
export function NumberField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  nullable,
  ...input
}: BaseProps<T, N> &
  Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "type"> & {
    /** Store an empty input as null (optional fields) instead of undefined. */
    nullable?: boolean;
  }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              {...input}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? (nullable ? null : undefined) : e.target.valueAsNumber,
                )
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Date picker (native <input type="date">); value is "YYYY-MM-DD" or "". */
export function DateField<T extends FieldValues, N extends FieldPath<T>>(
  props: BaseProps<T, N> &
    Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "type">,
) {
  return <TextField {...props} type="date" />;
}

export function SelectField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  onValueChange,
  ...select
}: BaseProps<T, N> &
  Omit<SelectInputProps, "value" | "onChange"> & {
    /** Runs after the user picks a value (not on form resets). */
    onValueChange?: (value: string) => void;
  }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <SelectInput
              {...select}
              value={field.value ?? ""}
              onChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function MultiSelectField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...select
}: BaseProps<T, N> & Omit<MultiSelectProps, "value" | "onChange">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <MultiSelect {...select} value={field.value ?? []} onChange={field.onChange} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Photo upload bound to a URL field. The image is uploaded as soon as it's
 * picked; the form stores its public URL ("" when there is none).
 */
export function ImageField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  folder,
  shape,
}: BaseProps<T, N> & {
  folder: ImageFolder;
  shape?: ComponentProps<typeof ImagePicker>["shape"];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <ImagePicker
              value={field.value ?? ""}
              onChange={field.onChange}
              folder={folder}
              shape={shape}
              ref={field.ref}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CheckboxField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  className,
}: BaseProps<T, N>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex items-start gap-3", className)}>
          <FormControl>
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
          </FormControl>
          <div className="grid gap-1 leading-none">
            <FormLabel className="font-normal">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: BaseProps<T, N> & { disabled?: boolean }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("flex items-center justify-between gap-4 rounded-md border p-3", className)}
        >
          <div className="grid gap-1">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={disabled || field.disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
