/**
 * Lyrics (client + server).
 *
 * Admins write the song as verses plus one chorus. It is stored as plain text
 * in the order it is sung, one section per block:
 *
 *   [Verse 1]
 *   [00:12.40] O Albert Academy…
 *
 *   [Chorus]
 *   [00:31.05] Esse quam videri…
 *
 * Timestamps are optional. When every line has one the player scrolls exactly
 * with the recording; otherwise it estimates each line's time from the song
 * length. Older text without section headers reads as verses separated by
 * blank lines.
 */
export type SectionKind = "verse" | "chorus";

export type LyricLine = {
  /** Seconds into the song, or null when not synced. */
  time: number | null;
  text: string;
  section: SectionKind;
  /** Set on the first line of each section: "Verse 2", "Chorus". */
  label: string | null;
};

/** What the admin edits: the verses, one chorus, and where the chorus is sung. */
export type LyricsDraft = {
  verses: string[];
  chorus: string;
  /** true: after every verse; false: once, after the last verse. */
  repeatChorus: boolean;
};

const STAMP = /^\s*\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*/;
const HEADER = /^\s*\[(verse|chorus)(?:\s+\d+)?\]\s*$/i;

export function parseLyrics(source: string | null | undefined): LyricLine[] {
  const lines: LyricLine[] = [];
  let kind: SectionKind = "verse";
  let newSection = true;
  let verseNo = 0;
  for (const raw of (source ?? "").split(/\r?\n/)) {
    const header = raw.match(HEADER);
    if (header) {
      kind = header[1].toLowerCase() as SectionKind;
      newSection = true;
      continue;
    }
    const match = raw.match(STAMP);
    const text = (match ? raw.slice(match[0].length) : raw).trim();
    if (!text) {
      if (lines.length) newSection = true;
      continue;
    }
    const time = match
      ? Number(match[1]) * 60 + Number(match[2]) + (match[3] ? Number(`0.${match[3]}`) : 0)
      : null;
    let label: string | null = null;
    if (newSection) {
      label = kind === "chorus" ? "Chorus" : `Verse ${++verseNo}`;
      newSection = false;
    }
    lines.push({ time, text, section: kind, label });
  }
  return lines;
}

/** Non-empty lines of a textarea, with any pasted timestamps removed. */
function cleanLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(STAMP, "").trim())
    .filter(Boolean);
}

/** The lines in the order they are sung (the chorus repeated where it belongs). */
export function draftLines(draft: LyricsDraft): LyricLine[] {
  const verses = draft.verses.map(cleanLines).filter((v) => v.length);
  const chorus = cleanLines(draft.chorus);
  const sections: Array<{ kind: SectionKind; lines: string[] }> = [];
  verses.forEach((lines, i) => {
    sections.push({ kind: "verse", lines });
    if (chorus.length && (draft.repeatChorus || i === verses.length - 1)) {
      sections.push({ kind: "chorus", lines: chorus });
    }
  });
  if (!verses.length && chorus.length) sections.push({ kind: "chorus", lines: chorus });

  let verseNo = 0;
  return sections.flatMap(({ kind, lines }) => {
    const label = kind === "chorus" ? "Chorus" : `Verse ${++verseNo}`;
    return lines.map((text, i) => ({
      time: null,
      text,
      section: kind,
      label: i === 0 ? label : null,
    }));
  });
}

/** Stored text -> the admin's draft, plus the saved timings (one per sung line). */
export function lyricsToDraft(source: string | null | undefined): LyricsDraft & {
  times: Array<number | null>;
} {
  const lines = parseLyrics(source);
  const sections: Array<{ kind: SectionKind; lines: LyricLine[] }> = [];
  for (const line of lines) {
    if (line.label || !sections.length) sections.push({ kind: line.section, lines: [] });
    sections.at(-1)!.lines.push(line);
  }
  const text = (s: { lines: LyricLine[] }) => s.lines.map((l) => l.text).join("\n");
  const verses = sections.filter((s) => s.kind === "verse").map(text);
  const choruses = sections.filter((s) => s.kind === "chorus");
  const draft: LyricsDraft = {
    verses,
    chorus: choruses[0] ? text(choruses[0]) : "",
    repeatChorus: choruses.length !== 1 || verses.length <= 1,
  };
  // Keep timings only if the draft rebuilds to the very same sung lines.
  const same = draftLines(draft).length === lines.length;
  const times = same && lines.some((l) => l.time !== null) ? lines.map((l) => l.time) : [];
  return { ...draft, times };
}

export const isSynced = (lines: LyricLine[]) =>
  lines.length > 0 && lines.every((l) => l.time !== null);

/** 83.456 -> "[01:23.45]" */
export function formatStamp(seconds: number) {
  const s = Math.max(0, seconds);
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  const cs = Math.floor((s % 1) * 100);
  return `[${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cs).padStart(2, "0")}]`;
}

/** 83 -> "1:23" */
export function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Start time of every line. Synced lyrics use their stamps; otherwise times
 * are spread over the song in proportion to each line's length (long lines
 * take longer to sing), leaving a short intro and outro.
 */
export function lineTimes(lines: LyricLine[], duration: number): number[] {
  if (isSynced(lines)) return lines.map((l) => l.time!);
  if (!duration || !lines.length) return lines.map(() => 0);
  const intro = duration * 0.06;
  const usable = duration * 0.9;
  const weights = lines.map((l, i) => l.text.length + 12 + (l.label && i > 0 ? 20 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let t = intro;
  return lines.map((_, i) => {
    const start = t;
    t += (weights[i] / total) * usable;
    return start;
  });
}

/** Index of the line being sung at `time` (-1 before the first line). */
export function activeLine(times: number[], time: number) {
  let index = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i] <= time + 0.05) index = i;
    else break;
  }
  return index;
}

/** Lines (+ optional timings) -> stored text with section headers. */
export function serializeLyrics(lines: LyricLine[], times?: Array<number | null>) {
  return lines
    .map((l, i) => {
      const t = times ? times[i] : l.time;
      const line = t === null || t === undefined ? l.text : `${formatStamp(t)} ${l.text}`;
      return l.label ? `${i > 0 ? "\n" : ""}[${l.label}]\n${line}` : line;
    })
    .join("\n");
}

/** "Verse 1 → Chorus → Verse 2 → Chorus" */
export function songOrder(lines: LyricLine[]) {
  return lines
    .map((l) => l.label)
    .filter(Boolean)
    .join(" → ");
}
