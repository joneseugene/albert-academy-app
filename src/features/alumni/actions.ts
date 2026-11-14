"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { alumnusFormSchema, updateAlumnusSchema } from "./schemas";
import { alumniService } from "./server/service";

export const createAlumnusAction = defineAction({
  input: alumnusFormSchema,
  handler: async (values) => {
    await alumniService.create(values);
    redirect(routes.alumni);
  },
});

export const updateAlumnusAction = defineAction({
  input: updateAlumnusSchema,
  handler: async ({ id, ...values }) => {
    await alumniService.update(id, values);
    redirect(routes.alumni);
  },
});

export const deleteAlumnusAction = defineAction({
  input: idSchema,
  handler: ({ id }) => alumniService.remove(id),
  refresh: true,
});
