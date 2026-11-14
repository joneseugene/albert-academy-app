"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { livestreamFormSchema, updateLivestreamSchema } from "./schemas";
import { livestreamsService } from "./server/service";

export const createLivestreamAction = defineAction({
  input: livestreamFormSchema,
  handler: async (values) => {
    await livestreamsService.create(values);
    redirect(routes.livestreams);
  },
});

export const updateLivestreamAction = defineAction({
  input: updateLivestreamSchema,
  handler: async ({ id, ...values }) => {
    await livestreamsService.update(id, values);
    redirect(routes.livestreams);
  },
});

export const setLivestreamStatusAction = defineAction({
  input: idSchema.extend({ status: z.enum(["scheduled", "live", "ended"]) }),
  handler: ({ id, status }) => livestreamsService.setStatus(id, status),
  refresh: true,
});

export const deleteLivestreamAction = defineAction({
  input: idSchema,
  handler: ({ id }) => livestreamsService.remove(id),
  refresh: true,
});
