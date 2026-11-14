"use server";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { idSchema } from "@/lib/validation";
import { defineAction } from "@/server/core/action";
import { createUserSchema, updateUserSchema } from "./schemas";
import { usersService } from "./server/service";

export const createUserAction = defineAction({
  input: createUserSchema,
  handler: async (values) => {
    await usersService.create(values);
    redirect(routes.users);
  },
});

export const updateUserAction = defineAction({
  input: updateUserSchema,
  handler: async ({ id, ...values }) => {
    await usersService.update(id, values);
    redirect(routes.users);
  },
});

export const deleteUserAction = defineAction({
  input: idSchema,
  handler: ({ id }) => usersService.remove(id),
  refresh: true,
});
