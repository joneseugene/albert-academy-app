import "server-only";
import sanitizeHtml from "sanitize-html";

import { toRichHtml } from "@/lib/rich-text";

/** Exactly what the editor can produce; everything else is dropped. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "a",
    "img",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    "*": ["style"],
  },
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
  },
};

/** Stored rich text (or legacy plain text) -> safe HTML for the website. */
export function sanitizeRich(value: string | null | undefined): string | null {
  const html = toRichHtml(value);
  return html ? sanitizeHtml(html, OPTIONS) : null;
}

/** Sanitize the given rich-text fields of a record. */
export function withSafeHtml<T extends object, K extends keyof T>(item: T, keys: K[]): T {
  const out = { ...item };
  for (const key of keys) {
    const value = out[key];
    if (typeof value === "string") out[key] = (sanitizeRich(value) ?? "") as T[K];
  }
  return out;
}
