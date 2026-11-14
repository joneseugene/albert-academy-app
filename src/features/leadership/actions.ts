"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { leaderFormSchema, updateLeaderSchema } from "./schemas";
import { leadershipService } from "./server/service";

export const createLeaderAction = defineAction({
  input: leaderFormSchema,
  handler: async (values) => {
    await leadershipService.create(values);
    redirect(routes.leadership);
  },
});

export const updateLeaderAction = defineAction({
  input: updateLeaderSchema,
  handler: async ({ id, ...values }) => {
    await leadershipService.update(id, values);
    redirect(routes.leadership);
  },
});

export const deleteLeaderAction = defineAction({
  input: idSchema,
  handler: ({ id }) => leadershipService.remove(id),
  refresh: true,
});
