"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { activityFormSchema, updateActivitySchema } from "./schemas";
import { activitiesService } from "./server/service";

export const createActivityAction = defineAction({
  input: activityFormSchema,
  handler: async (values) => {
    await activitiesService.create(values);
    redirect(routes.activities);
  },
});

export const updateActivityAction = defineAction({
  input: updateActivitySchema,
  handler: async ({ id, ...values }) => {
    await activitiesService.update(id, values);
    redirect(routes.activities);
  },
});

export const deleteActivityAction = defineAction({
  input: idSchema,
  handler: ({ id }) => activitiesService.remove(id),
  refresh: true,
});
