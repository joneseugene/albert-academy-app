/** Shared display formatting (client- and server-safe). */

const LOCALE = "en-GB";

/** Always two decimals with thousands separators, e.g. "SLE 1,250.50". */
export function formatMoney(amount: number, currency = "SLE") {
  const digits = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try {
    return new Intl.NumberFormat(LOCALE, { style: "currency", currency, ...digits }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(LOCALE, digits)}`;
  }
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Human-friendly relative date: "just now", "2 mins ago", "3 hours ago",
 * "yesterday", "4 days ago", then "12 Nov" (this year) or "12 Nov 2025".
 */
export function formatRelative(value: Date | string | null | undefined, now: Date = new Date()) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = now.getTime() - date.getTime();
  const future = diff < 0;
  const abs = Math.abs(diff);
  const wrap = (s: string) => (future ? `in ${s}` : `${s} ago`);

  if (abs < 45_000) return "just now";
  if (abs < HOUR) return wrap(plural(Math.max(1, Math.round(abs / MINUTE)), "min"));

  const dayDelta = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
  if (dayDelta === 0) return wrap(plural(Math.round(abs / HOUR), "hour"));
  if (dayDelta === 1) return "yesterday";
  if (dayDelta === -1) return "tomorrow";
  if (dayDelta > 1 && dayDelta < 7) return `${dayDelta} days ago`;
  if (dayDelta < -1 && dayDelta > -7) return `in ${-dayDelta} days`;

  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  }).format(date);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** "Bachelor's Degree (Hons)" -> "bachelors-degree-hons" */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}
