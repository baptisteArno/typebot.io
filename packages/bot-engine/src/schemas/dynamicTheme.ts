import { z } from "@typebot.io/zod";

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
});
