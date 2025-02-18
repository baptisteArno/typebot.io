import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const logSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  resultId: z.string(),
  status: z.string(),
  description: z.string(),
  details: z.string().nullable(),
  context: z.string().nullable(),
}) satisfies z.ZodType<Prisma.Log>;
export type Log = z.infer<typeof logSchema>;

export const logInSessionSchema = z.object({
  status: z.string().optional(),
  description: z.string(),
  details: z.string().optional(),
  context: z.string().optional(),
}) satisfies z.ZodType<Partial<Prisma.Log>>;
export type LogInSession = z.infer<typeof logInSessionSchema>;
