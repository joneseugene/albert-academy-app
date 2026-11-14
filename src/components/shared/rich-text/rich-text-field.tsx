"use client";

import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor, type RichTextEditorProps } from "./rich-text-editor";

/**
 * WYSIWYG text field wired to react-hook-form (stores HTML). Pair it with
 * `richText(max)` from "@/lib/rich-text" in the zod schema.
 *
 *   <RichTextField control={c} name="content" label="Content" imageFolder="news" />
 */
export function RichTextField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...editor
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: N;
  label: string;
  description?: ReactNode;
  required?: boolean;
  className?: string;
} & Pick<RichTextEditorProps, "variant" | "imageFolder" | "maxLength" | "placeholder">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && (
              <span className="text-destructive" aria-hidden>
                *
              </span>
            )}
          </FormLabel>
          <FormControl>
            <RichTextEditor
              {...editor}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled}
              invalid={Boolean(fieldState.error)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
