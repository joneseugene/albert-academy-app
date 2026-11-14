"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { noticeFormSchema, updateNoticeSchema } from "./schemas";
import { noticesService } from "./server/service";

export const createNoticeAction = defineAction({
  input: noticeFormSchema,
  handler: async (values) => {
    await noticesService.create(values);
    redirect(routes.notices);
  },
});

export const updateNoticeAction = defineAction({
  input: updateNoticeSchema,
  handler: async ({ id, ...values }) => {
    await noticesService.update(id, values);
    redirect(routes.notices);
  },
});

export const setNoticePublishedAction = defineAction({
  input: idSchema.extend({ isPublished: z.boolean() }),
  handler: ({ id, isPublished }) => noticesService.setPublished(id, isPublished),
  refresh: true,
});

export const deleteNoticeAction = defineAction({
  input: idSchema,
  handler: ({ id }) => noticesService.remove(id),
  refresh: true,
});
