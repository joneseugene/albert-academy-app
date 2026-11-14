"use server";

import { defineAction } from "@/server/core/action";
import { schoolInfoFormSchema } from "./schemas";
import { schoolService } from "./server/service";

export const updateSchoolInfoAction = defineAction({
  input: schoolInfoFormSchema,
  handler: async (values) => {
    await schoolService.update(values);
  },
  refresh: true,
});
