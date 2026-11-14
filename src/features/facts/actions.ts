"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { factFormSchema, updateFactSchema } from "./schemas";
import { factsService } from "./server/service";

export const createFactAction = defineAction({
  input: factFormSchema,
  handler: async (values) => {
    await factsService.create(values);
    redirect(routes.facts);
  },
});

export const updateFactAction = defineAction({
  input: updateFactSchema,
  handler: async ({ id, ...values }) => {
    await factsService.update(id, values);
    redirect(routes.facts);
  },
});

export const setFactPublishedAction = defineAction({
  input: idSchema.extend({ isPublished: z.boolean() }),
  handler: async ({ id, isPublished }) => {
    await factsService.setPublished(id, isPublished);
  },
  refresh: true,
});

export const deleteFactAction = defineAction({
  input: idSchema,
  handler: ({ id }) => factsService.remove(id),
  refresh: true,
});
