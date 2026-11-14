/*
 * Live streams (client + server, no dependencies).
 *
 * The admin pastes an ordinary YouTube or Facebook link; everything needed to
 * embed it is worked out here, so nobody writes embed code by hand.
 *
 *   YouTube  youtube.com/watch?v=ID · youtu.be/ID · youtube.com/live/ID ·
 *            youtube.com/embed/ID · youtube.com/shorts/ID ·
 *            youtube.com/channel/UC… (always shows that channel's current live)
 *   Facebook facebook.com/<page>/videos/ID · facebook.com/watch/?v=ID ·
 *            facebook.com/reel/ID · facebook.com/share/v/… · facebook.com/<page>/live_videos/…
 */

export const STREAM_PLATFORMS = { youtube: "YouTube", facebook: "Facebook" } as const;
export type StreamPlatform = keyof typeof STREAM_PLATFORMS;

export const STREAM_STATUSES = {
  scheduled: "Upcoming",
  live: "Live now",
  ended: "Ended",
} as const;
export type StreamStatus = keyof typeof STREAM_STATUSES;

export type ParsedStream =
  | { ok: true; platform: "youtube"; kind: "video" | "channel"; id: string; url: string }
  | { ok: true; platform: "facebook"; kind: "video"; id: null; url: string }
  | { ok: false; error: string };

/** Player options the admin sets per stream. */
export type PlayerOptions = {
  autoplay: boolean;
  startMuted: boolean;
  showControls: boolean;
  showChat: boolean;
  privacyMode: boolean;
};

const YT_ID = /^[\w-]{11}$/;
const YT_CHANNEL = /^UC[\w-]{22}$/;

export function parseStreamUrl(raw: string): ParsedStream {
  const value = raw.trim();
  if (!value) return { ok: false, error: "Paste the YouTube or Facebook link" };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return { ok: false, error: "That doesn't look like a link" };
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m|web|music)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  // ---------- YouTube
  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (["live", "embed", "shorts", "v"].includes(parts[0] ?? "")) id = parts[1] ?? null;

    if (parts[0] === "embed" && parts[1] === "live_stream") {
      const channel = url.searchParams.get("channel") ?? "";
      if (YT_CHANNEL.test(channel)) return youtubeChannel(channel);
    }
    if (id && YT_ID.test(id)) {
      return {
        ok: true,
        platform: "youtube",
        kind: "video",
        id,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }
    if (parts[0] === "channel" && YT_CHANNEL.test(parts[1] ?? "")) return youtubeChannel(parts[1]);
    if (parts[0]?.startsWith("@") || parts[0] === "c" || parts[0] === "user") {
      return {
        ok: false,
        error:
          "Channel names can't be embedded. Use the live video's link (Share → Copy link), or the channel ID link youtube.com/channel/UC…",
      };
    }
    return { ok: false, error: "Couldn't find a video in that YouTube link" };
  }

  // ---------- Facebook
  if (host === "facebook.com" || host === "fb.watch") {
    if (host === "fb.watch") {
      return {
        ok: false,
        error:
          "Short fb.watch links can't be embedded. Open it and copy the full facebook.com address.",
      };
    }
    const isVideo =
      parts.includes("videos") ||
      parts.includes("live_videos") ||
      parts[0] === "reel" ||
      (parts[0] === "watch" && (url.searchParams.has("v") || parts[1] === "live")) ||
      (parts[0] === "share" && (parts[1] === "v" || parts[1] === "r"));
    if (!isVideo) {
      return {
        ok: false,
        error:
          "Use the link of the live video itself (on the video: ⋯ → Copy link), not the page's link.",
      };
    }
    // Canonical address for the embed plugin (desktop host, no tracking params).
    const clean = new URL(`https://www.facebook.com${url.pathname}`);
    const v = url.searchParams.get("v");
    if (v) clean.searchParams.set("v", v);
    return { ok: true, platform: "facebook", kind: "video", id: null, url: clean.toString() };
  }

  return { ok: false, error: "Only YouTube and Facebook links are supported" };
}

function youtubeChannel(id: string): ParsedStream {
  return {
    ok: true,
    platform: "youtube",
    kind: "channel",
    id,
    url: `https://www.youtube.com/channel/${id}/live`,
  };
}

/** The iframe address for a stream with the admin's options. */
export function embedUrl(stream: ParsedStream, o: PlayerOptions): string | null {
  if (!stream.ok) return null;
  const flag = (b: boolean) => (b ? "1" : "0");

  if (stream.platform === "youtube") {
    const base = o.privacyMode ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
    const path =
      stream.kind === "channel"
        ? `/embed/live_stream?channel=${stream.id}&`
        : `/embed/${stream.id}?`;
    const params = new URLSearchParams({
      autoplay: flag(o.autoplay),
      mute: flag(o.startMuted),
      controls: flag(o.showControls),
      playsinline: "1",
      rel: "0",
    });
    return `${base}${path}${params}`;
  }

  const params = new URLSearchParams({
    href: stream.url,
    show_text: "false",
    autoplay: String(o.autoplay),
    mute: flag(o.startMuted),
    allowfullscreen: "true",
    width: "1280",
  });
  return `https://www.facebook.com/plugins/video.php?${params}`;
}

/** YouTube live chat beside the player (YouTube videos only; needs the site's host name). */
export function chatUrl(stream: ParsedStream, host: string): string | null {
  if (!stream.ok || stream.platform !== "youtube" || stream.kind !== "video") return null;
  return `https://www.youtube.com/live_chat?v=${stream.id}&embed_domain=${encodeURIComponent(host)}`;
}

/** Thumbnail: the admin's own photo, else YouTube's still for the video. */
export function streamThumbnail(stream: ParsedStream, photoUrl?: string | null): string | null {
  if (photoUrl) return photoUrl;
  if (stream.ok && stream.platform === "youtube" && stream.kind === "video") {
    return `https://i.ytimg.com/vi/${stream.id}/hqdefault.jpg`;
  }
  return null;
}

/** Which options apply to a platform (the form disables the rest). */
export function supportedOptions(stream: ParsedStream) {
  const yt = stream.ok && stream.platform === "youtube";
  return {
    showControls: yt,
    privacyMode: yt,
    showChat: yt && stream.kind === "video",
  };
}

/** Times are entered and shown in school time (Freetown, GMT). */
export const SCHOOL_TIME_ZONE = "Africa/Freetown";

/** "Sat 20 Nov 2026, 10:00" in school time. */
export function formatStreamTime(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date(value));
}
