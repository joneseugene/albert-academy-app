import "server-only";

import { parseStreamUrl, supportedOptions, type StreamStatus } from "@/lib/livestream";
import { emptyToNull } from "@/lib/validation";
import { AppError } from "@/server/core/errors";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { livestreamSchema, type Livestream, type LivestreamFormValues } from "../schemas";

type LivestreamWrite = Omit<
  Livestream,
  "id" | "createdAt" | "updatedAt" | "startsAt" | "endsAt"
> & {
  startsAt: string | null;
  endsAt: string | null;
};

export const livestreamsResource = defineResource<
  Livestream,
  LivestreamWrite,
  Partial<LivestreamWrite>
>({
  name: "livestreams",
  entity: livestreamSchema,
  searchable: ["title"],
  sortable: ["title", "status", "startsAt", "createdAt", "updatedAt"],
  filterable: ["status", "platform"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(livestreamsResource, "livestreams");

/** "2026-11-20T10:00" entered in school time (Freetown = GMT) -> ISO instant. */
const fromLocal = (v: string) => (v ? new Date(`${v}:00Z`).toISOString() : null);

function toWrite(v: LivestreamFormValues): LivestreamWrite {
  const parsed = parseStreamUrl(v.sourceUrl);
  if (!parsed.ok) throw AppError.validation(parsed.error);
  const supported = supportedOptions(parsed);
  return {
    title: v.title,
    description: emptyToNull(v.description),
    platform: parsed.platform,
    sourceUrl: parsed.url,
    status: v.status,
    startsAt: fromLocal(v.startsAt),
    endsAt: fromLocal(v.endsAt),
    photoUrl: emptyToNull(v.photoUrl),
    isFeatured: v.isFeatured,
    showReplay: v.showReplay,
    autoplay: v.autoplay,
    startMuted: v.startMuted,
    // Options a platform can't honour are stored off, so the website never pretends.
    showControls: supported.showControls ? v.showControls : true,
    showChat: supported.showChat && v.showChat,
    privacyMode: supported.privacyMode && v.privacyMode,
  };
}

export const livestreamsService = {
  ...crud,
  create: (values: LivestreamFormValues) => crud.create(toWrite(values)),
  update: (id: string, values: LivestreamFormValues) => crud.update(id, toWrite(values)),
  /** "Go live" / "End stream" from the list, without opening the form. */
  setStatus: (id: string, status: StreamStatus) => crud.update(id, { status }),
};
