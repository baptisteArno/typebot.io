import { z } from "@typebot.io/zod";

export const cookieValueSchema = z.object({
  consent: z.enum(["declined", "accepted"]),
  landingPage: z
    .object({
      id: z.string(),
      isMerged: z.boolean(),
      session: z.object({
        id: z.string(),
        createdAt: z.number(),
      }),
    })
    .optional(),
  lastProvider: z.string().optional(),
});
export type TypebotCookieValue = z.infer<typeof cookieValueSchema>;
