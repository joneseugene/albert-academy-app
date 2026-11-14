"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { newsFormSchema, updateNewsSchema } from "./schemas";
import { newsService } from "./server/service";

export const createNewsAction = defineAction({
  input: newsFormSchema,
  handler: async (values) => {
    await newsService.create(values);
    redirect(routes.news);
  },
});

export const updateNewsAction = defineAction({
  input: updateNewsSchema,
  handler: async ({ id, ...values }) => {
    await newsService.update(id, values);
    redirect(routes.news);
  },
});

export const deleteNewsAction = defineAction({
  input: idSchema,
  handler: ({ id }) => newsService.remove(id),
  refresh: true,
});
