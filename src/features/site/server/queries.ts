import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { activitiesResource } from "@/features/activities/server/service";
import { administratorsResource } from "@/features/administration/server/service";
import { alumniResource } from "@/features/alumni/server/service";
import { factsResource } from "@/features/facts/server/service";
import { galleryResource } from "@/features/gallery/server/service";
import { leadersResource } from "@/features/leadership/server/service";
import { sortStreams, type Livestream } from "@/features/livestreams/schemas";
import { livestreamsResource } from "@/features/livestreams/server/service";
import { newsResource } from "@/features/news/server/service";
import { noticesResource } from "@/features/notices/server/service";
import { academicResourcesResource } from "@/features/resources/server/service";
import { schoolInfoSchema } from "@/features/school/schemas";
import { songSchema } from "@/features/song/schemas";
import { PUBLIC_CACHE_TAG } from "@/lib/cache-tags";
import type { ListQuery } from "@/lib/data/query";
import { backend } from "@/server/backend";
import { defineResource, type ResourceDefinition } from "@/server/core/resource";
import { withSafeHtml } from "@/server/core/sanitize";

/*
 * Public website reads. No session, no permissions: these only ever return
 * PUBLISHED, non-deleted content. Rich-text fields come back as sanitized HTML. Results are cached (tag PUBLIC_CACHE_TAG)
 * and refreshed by every admin save (see createContentService / updateTag).
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const schoolWithSong = defineResource({
  name: "school_info",
  entity: schoolInfoSchema.extend(songSchema.shape),
});
export type PublicSchool = Awaited<ReturnType<typeof getSchool>>;

async function list<T>(resource: ResourceDefinition<T, unknown, unknown>, query: ListQuery) {
  const page = await backend.repository(resource).list({ pageSize: 100, ...query });
  return page.items;
}

/** A single record by id; invalid ids are simply "not found". */
async function byId<T>(resource: ResourceDefinition<T, unknown, unknown>, id: string) {
  if (!UUID.test(id)) return null;
  return backend.repository(resource).getById(id);
}

export async function getSchool() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const school = await backend.repository(schoolWithSong).getById("1");
  return school && withSafeHtml(school, ["vision", "mission", "about", "history", "namesakeAbout"]);
}

const published = { field: "status", op: "eq" as const, value: "published" };

export async function getNews(limit = 100) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(newsResource, {
    pageSize: limit,
    filters: [published],
    sort: [{ field: "publishedAt", direction: "desc" }],
  });
  return items.map((n) => withSafeHtml(n, ["summary", "content"]));
}

export async function getNewsItem(id: string) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const item = await byId(newsResource, id);
  return item?.status === "published" ? withSafeHtml(item, ["summary", "content"]) : null;
}

export async function getActivities(limit = 100) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(activitiesResource, {
    pageSize: limit,
    sort: [{ field: "startDate", direction: "desc" }],
  });
  return items.map((a) => withSafeHtml(a, ["description"]));
}

export async function getActivity(id: string) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const item = await byId(activitiesResource, id);
  return item && withSafeHtml(item, ["description"]);
}

export async function getGallery(limit = 100) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(galleryResource, { pageSize: limit });
  return items.map((g) => withSafeHtml(g, ["description"]));
}

export async function getAlumni(limit = 100) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(alumniResource, { pageSize: limit });
  return items.map((a) => withSafeHtml(a, ["summary", "detail"]));
}

export async function getAlumnus(id: string) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const item = await byId(alumniResource, id);
  return item && withSafeHtml(item, ["summary", "detail"]);
}

export async function getLeaders() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(leadersResource, { sort: [{ field: "fromYear", direction: "desc" }] });
  return items.map((l) => withSafeHtml(l, ["summary"]));
}

export async function getAdministrators() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  return list(administratorsResource, {});
}

export async function getResources() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(academicResourcesResource, {});
  return items.map((r) => withSafeHtml(r, ["description"]));
}

export async function getFacts() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  return list(factsResource, {
    filters: [{ field: "isPublished", op: "eq", value: true }],
  });
}

/** Hidden: ended streams without a replay. */
const visibleStream = (s: Livestream) => s.status !== "ended" || s.showReplay;

/** Live first, then upcoming (soonest first), then replays (newest first). */
export async function getLivestreams() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(livestreamsResource, {});
  return sortStreams(items.filter(visibleStream)).map((s) => withSafeHtml(s, ["description"]));
}

export async function getLivestream(id: string) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const item = await byId(livestreamsResource, id);
  return item && visibleStream(item) ? withSafeHtml(item, ["description"]) : null;
}

/** Published public notices, newest first. */
export async function getNotices() {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const items = await list(noticesResource, {
    filters: [{ field: "isPublished", op: "eq", value: true }],
    sort: [{ field: "publishedAt", direction: "desc" }],
  });
  return items.map((n) => withSafeHtml(n, ["body"]));
}

export async function getNotice(id: string) {
  "use cache";
  cacheTag(PUBLIC_CACHE_TAG);
  cacheLife("hours");
  const item = await byId(noticesResource, id);
  return item?.isPublished ? withSafeHtml(item, ["body"]) : null;
}
