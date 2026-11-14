import "server-only";

import { createContentService } from "@/server/core/content";
import { defineResource } from "@/server/core/resource";
import { noticeSchema, type Notice, type NoticeFormValues } from "../schemas";

type NoticeWrite = {
  title: string;
  body: string;
  isPublished: boolean;
  showBanner: boolean;
  bannerFrom: string | null;
  bannerUntil: string | null;
  publishedAt?: string | null;
};

export const noticesResource = defineResource<Notice, NoticeWrite, Partial<NoticeWrite>>({
  name: "notices",
  entity: noticeSchema,
  searchable: ["title"],
  sortable: ["title", "isPublished", "publishedAt", "bannerUntil", "createdAt", "updatedAt"],
  filterable: ["isPublished"],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
  softDelete: true,
});

const crud = createContentService(noticesResource, "notices");

/** "2026-11-20T10:00" entered in school time (Freetown = GMT) -> ISO instant. */
const fromLocal = (v: string) => (v ? new Date(`${v}:00Z`).toISOString() : null);

const toWrite = (v: NoticeFormValues): NoticeWrite => ({
  title: v.title,
  body: v.body,
  isPublished: v.isPublished,
  showBanner: v.showBanner,
  bannerFrom: fromLocal(v.bannerFrom),
  bannerUntil: fromLocal(v.bannerUntil),
});

/** First publish stamps the notice date; later publishes keep it. */
const stamp = (existing: Date | null, published: boolean) =>
  existing?.toISOString() ?? (published ? new Date().toISOString() : null);

export const noticesService = {
  ...crud,

  create: (v: NoticeFormValues) =>
    crud.create({ ...toWrite(v), publishedAt: stamp(null, v.isPublished) }),

  async update(id: string, v: NoticeFormValues) {
    const existing = await crud.get(id);
    return crud.update(id, {
      ...toWrite(v),
      publishedAt: stamp(existing.publishedAt, v.isPublished),
    });
  },

  /** Publish / unpublish from the list without opening the form. */
  async setPublished(id: string, isPublished: boolean) {
    const existing = await crud.get(id);
    return crud.update(id, { isPublished, publishedAt: stamp(existing.publishedAt, isPublished) });
  },
};
