import "server-only";

import { toDateSpan } from "@/lib/date-span";
import { emptyToNull } from "@/lib/validation";
import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { newsSchema, type News, type NewsFormValues } from "../schemas";

type NewsWrite = {
  title: string;
  photoUrl: string | null;
  summary: string | null;
  content: string;
  status: News["status"];
  publishedAt?: string | null;
  eventPrecision: News["eventPrecision"];
  eventStart: string | null;
  eventEnd: string | null;
};

export const newsResource = defineResource<News, NewsWrite, NewsWrite>({
  name: "news",
  entity: newsSchema,
  searchable: ["title", "summary"],
  sortable: ["title", "status", "publishedAt", "eventStart", "createdAt", "updatedAt"],
  filterable: ["status"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(newsResource, "news");

const toWrite = (v: NewsFormValues): NewsWrite => {
  const span = toDateSpan(v.when);
  return {
    title: v.title,
    photoUrl: emptyToNull(v.photoUrl),
    summary: emptyToNull(v.summary),
    content: v.content,
    status: v.status,
    eventPrecision: span.precision,
    eventStart: span.start,
    eventEnd: span.end,
  };
};

export const newsService = {
  ...crud,

  /** Publishing stamps the publish date (once — re-publishing keeps the original date). */
  create(values: NewsFormValues) {
    return crud.create({
      ...toWrite(values),
      publishedAt: values.status === "published" ? new Date().toISOString() : null,
    });
  },

  async update(id: string, values: NewsFormValues) {
    const existing = await crud.get(id);
    const publishedAt =
      values.status === "published"
        ? (existing.publishedAt?.toISOString() ?? new Date().toISOString())
        : (existing.publishedAt?.toISOString() ?? null);
    return crud.update(id, { ...toWrite(values), publishedAt });
  },
};
