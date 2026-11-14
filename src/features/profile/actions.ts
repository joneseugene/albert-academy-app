"use server";

import { z } from "zod";

import { emptyToNull } from "@/lib/validation";
import { backend } from "@/server/backend";
import { defineAction } from "@/server/core/action";
import { defineResource } from "@/server/core/resource";
import { profileSchema } from "./schemas";

/** The signed-in user's own row — only the fields they may change themselves. */
const ownProfile = defineResource<
  { id: string },
  never,
  { firstName: string; lastName: string; phone: string | null; avatarUrl: string | null }
>({
  name: "users",
  entity: z.object({ id: z.string() }),
  softDelete: true,
  adapters: { supabase: { table: "users", select: "id" } },
});

export const updateProfileAction = defineAction({
  input: profileSchema,
  handler: async (values, { user }) => {
    await backend.repository(ownProfile).update(user.id, {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: emptyToNull(values.phone),
      avatarUrl: emptyToNull(values.avatarUrl),
    });
  },
  refresh: true,
});
