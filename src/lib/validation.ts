import { z } from "zod";

/** Shared zod building blocks for forms (client) and actions (server). */

export const requiredText = (max = 200) =>
  z.string().trim().min(1, "Required").max(max, `At most ${max} characters`);

export const optionalText = (max = 200) => z.string().trim().max(max, `At most ${max} characters`);

/** E.164 phone, optional. Accepts "" from empty inputs. */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^\+?[0-9 ()-]{7,20}$/.test(v),
    "Enter a valid phone number, e.g. +232 76 123 456",
  );

export const urlSchema = z
  .string()
  .trim()
  .refine((v) => /^https?:\/\/\S+\.\S+/.test(v), "Enter a full URL, e.g. https://example.com");

export const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v),
    "Enter a full URL, e.g. https://example.com",
  );

/** Uploaded image URL ("" = none). */
export const imageUrlSchema = z.string().trim().max(1000);

/** "" or YYYY-MM-DD from <input type="date">. */
export const optionalDateSchema = z
  .string()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date");

export const requiredDateSchema = z
  .string()
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a date");

const thisYear = () => new Date().getFullYear();

/** A year as typed in a NumberField (number | undefined). */
export const yearSchema = z
  .number({ error: "Enter a year" })
  .int("Enter a whole year")
  .min(1800, "Too early")
  .refine((v) => v <= thisYear() + 1, "That year is in the future");

export const optionalYearSchema = yearSchema.optional().nullable();

/** Input of update/delete actions. */
export const idSchema = z.object({ id: z.string().min(1) });

/** Turn "" from optional inputs into null for storage. */
export const emptyToNull = (value: string | undefined | null) => (value ? value : null);
