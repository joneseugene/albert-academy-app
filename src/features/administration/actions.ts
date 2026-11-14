"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { administratorFormSchema, updateAdministratorSchema } from "./schemas";
import { administrationService } from "./server/service";

export const createAdministratorAction = defineAction({
  input: administratorFormSchema,
  handler: async (values) => {
    await administrationService.create(values);
    redirect(routes.administration);
  },
});

export const updateAdministratorAction = defineAction({
  input: updateAdministratorSchema,
  handler: async ({ id, ...values }) => {
    await administrationService.update(id, values);
    redirect(routes.administration);
  },
});

export const deleteAdministratorAction = defineAction({
  input: idSchema,
  handler: ({ id }) => administrationService.remove(id),
  refresh: true,
});
