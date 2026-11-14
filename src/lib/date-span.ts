import { z } from "zod";

/*
 * "When" something happened, as precise as the admin knows it:
 *   a single date · a date range · a year · a range of years.
 *
 * Stored as a precision ("day" | "year") plus a real start and end date, so
 * sorting and "upcoming / ongoing / past" keep working. A year is stored as
 * 1 Jan – 31 Dec: 2019 -> 2019-01-01 … 2019-12-31; 2019–2021 -> 2019-01-01 … 2021-12-31.
 */

export const DATE_MODES = {
  date: "Single date",
  range: "Date range",
  year: "Year",
  "year-range": "Year range",
} as const;
export type DateMode = keyof typeof DATE_MODES;
export type DatePrecision = "day" | "year";

/** Form value. Dates are "YYYY-MM-DD", years are "YYYY". */
export type DateSpanValue = { mode: DateMode | "none"; start: string; end: string };

/** Stored value. */
export type DateSpan = {
  precision: DatePrecision | null;
  start: string | null;
  end: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR = /^\d{4}$/;
const MIN_YEAR = 1800;
const MAX_YEAR = 2100;

export const datePrecisionSchema = z.enum(["day", "year"]);

/** Zod field for the form value. `optional` adds a "No date" choice. */
export function dateSpanSchema({ optional = false } = {}) {
  return z
    .object({
      mode: z.enum(["none", "date", "range", "year", "year-range"]),
      start: z.string().trim(),
      end: z.string().trim(),
    })
    .superRefine((v, ctx) => {
      const issue = (path: "mode" | "start" | "end", message: string) =>
        ctx.addIssue({ code: "custom", path: [path], message });

      if (v.mode === "none") {
        if (!optional) issue("mode", "Choose when it happens");
        return;
      }
      const years = v.mode === "year" || v.mode === "year-range";
      const ranged = v.mode === "range" || v.mode === "year-range";
      const valid = (s: string) =>
        years ? YEAR.test(s) && +s >= MIN_YEAR && +s <= MAX_YEAR : DATE.test(s);
      const what = years ? `a year (${MIN_YEAR}–${MAX_YEAR})` : "a date";

      if (!valid(v.start)) issue("start", v.start ? `Enter ${what}` : "Required");
      if (!ranged) return;
      if (!valid(v.end)) issue("end", v.end ? `Enter ${what}` : "Required");
      else if (valid(v.start) && v.end < v.start) {
        issue(
          "end",
          years
            ? "Must be the same as or after the start year"
            : "Must be on or after the start date",
        );
      }
    });
}

export const emptyDateSpan = (mode: DateSpanValue["mode"] = "date"): DateSpanValue => ({
  mode,
  start: "",
  end: "",
});

/** Form value -> stored value. */
export function toDateSpan(v: DateSpanValue): DateSpan {
  switch (v.mode) {
    case "date":
      return { precision: "day", start: v.start, end: null };
    case "range":
      return { precision: "day", start: v.start, end: v.end === v.start ? null : v.end };
    case "year":
      return { precision: "year", start: `${v.start}-01-01`, end: `${v.start}-12-31` };
    case "year-range":
      return { precision: "year", start: `${v.start}-01-01`, end: `${v.end}-12-31` };
    default:
      return { precision: null, start: null, end: null };
  }
}

/** Stored value -> form value (`fallback` when there is none). */
export function fromDateSpan(s: DateSpan, fallback: DateSpanValue["mode"] = "date"): DateSpanValue {
  if (!s.start) return emptyDateSpan(fallback);
  if (s.precision === "year") {
    const from = s.start.slice(0, 4);
    const to = (s.end ?? s.start).slice(0, 4);
    return from === to
      ? { mode: "year", start: from, end: "" }
      : { mode: "year-range", start: from, end: to };
  }
  return s.end && s.end !== s.start
    ? { mode: "range", start: s.start, end: s.end }
    : { mode: "date", start: s.start, end: "" };
}

const utc = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00Z`);
const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" });
const dayMonthYear = fmt({ day: "numeric", month: "short", year: "numeric" });
const dayMonth = fmt({ day: "numeric", month: "short" });

/**
 * "12 Mar 2026" · "12–14 Mar 2026" · "28 Mar – 2 Apr 2026" ·
 * "28 Dec 2025 – 3 Jan 2026" · "2019" · "2019 – 2021"
 */
export function formatDateSpan(s: DateSpan): string {
  if (!s.start) return "";
  if (s.precision === "year") {
    const from = s.start.slice(0, 4);
    const to = (s.end ?? s.start).slice(0, 4);
    return from === to ? from : `${from}–${to}`;
  }
  const a = utc(s.start);
  if (!s.end || s.end === s.start) return dayMonthYear.format(a);
  const b = utc(s.end);
  if (a.getUTCFullYear() !== b.getUTCFullYear()) {
    return `${dayMonthYear.format(a)} to ${dayMonthYear.format(b)}`;
  }
  if (a.getUTCMonth() !== b.getUTCMonth()) {
    return `${dayMonth.format(a)} to ${dayMonthYear.format(b)}`;
  }
  return `${a.getUTCDate()}–${dayMonthYear.format(b)}`;
}
