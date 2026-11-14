"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { resourceFormSchema, updateResourceSchema } from "./schemas";
import { resourcesService } from "./server/service";

export const createResourceAction = defineAction({
  input: resourceFormSchema,
  handler: async (values) => {
    await resourcesService.create(values);
    redirect(routes.resources);
  },
});

export const updateResourceAction = defineAction({
  input: updateResourceSchema,
  handler: async ({ id, ...values }) => {
    await resourcesService.update(id, values);
    redirect(routes.resources);
  },
});

export const deleteResourceAction = defineAction({
  input: idSchema,
  handler: ({ id }) => resourcesService.remove(id),
  refresh: true,
});
