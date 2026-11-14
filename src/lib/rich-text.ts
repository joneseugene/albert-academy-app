import { z } from "zod";

/*
 * Rich text (client + server, no dependencies).
 *
 * Long text fields are written in a WYSIWYG editor and stored as HTML. Text
 * saved before the editor existed is plain text; `toRichHtml` upgrades it on
 * the fly (blank line = new paragraph, single newline = line break).
 * HTML is sanitized on the server before the website renders it
 * (src/server/core/sanitize.ts).
 */

/** Does this look like editor HTML (vs. legacy plain text)? */
export const isHtml = (value: string) =>
  /^\s*<(p|h[1-6]|ul|ol|blockquote|hr|img|div|pre)\b/i.test(value);

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text or HTML -> HTML ("" stays ""). */
export function toRichHtml(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  if (isHtml(value)) return value;
  return value
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " ",
};

/** HTML (or plain text) -> readable plain text, for excerpts, cards and lists. */
export function htmlToText(value: string | null | undefined): string {
  if (!value) return "";
  if (!isHtml(value)) return value.trim();
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/(p|h[1-6]|li|blockquote|div|pre)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(
      /&(#?\w+);/g,
      (m, code: string) =>
        ENTITIES[code] ?? (code.startsWith("#") ? String.fromCharCode(Number(code.slice(1))) : m),
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** First paragraph as plain text, trimmed to about `max` characters on a word boundary. */
export function excerpt(value: string | null | undefined, max = 220): string | null {
  const text = htmlToText(value);
  if (!text) return null;
  const first = text.split("\n")[0].trim();
  return first.length > max ? `${first.slice(0, max).replace(/\s+\S*$/, "")}…` : first;
}

/**
 * Zod field for editor HTML. `max` limits the visible text (not the markup);
 * an empty editor ("<p></p>") becomes "".
 */
export function richText(max: number, { required = false } = {}) {
  return z
    .string()
    .max(max * 6 + 20_000, "This text is too long")
    .transform((v) => (htmlToText(v) || /<img\b/i.test(v) ? v.trim() : ""))
    .refine((v) => !required || v !== "", "Required")
    .refine((v) => htmlToText(v).length <= max, `At most ${max.toLocaleString()} characters`);
}
