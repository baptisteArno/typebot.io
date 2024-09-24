import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

const answerV1Schema = z.object({
  createdAt: z.date(),
  resultId: z.string(),
  blockId: z.string(),
  groupId: z.string(),
  variableId: z.string().nullable(),
  content: z.string(),
}) satisfies z.ZodType<Prisma.Answer>;

export const answerSchema = z.object({
  blockId: z.string(),
  content: z.string(),
  attachedFileUrls: z.array(z.string()).optional(),
});

export const answerInputSchema = answerV1Schema
  .omit({
    createdAt: true,
    resultId: true,
    variableId: true,
  })
  .extend({
    variableId: z.string().nullish(),
  }) satisfies z.ZodType<Prisma.Prisma.AnswerUncheckedUpdateInput>;

export const statsSchema = z.object({
  totalViews: z.number(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
});

export type Stats = z.infer<typeof statsSchema>;

export type Answer = z.infer<typeof answerSchema>;

export type AnswerInput = z.infer<typeof answerInputSchema>;

export const answerInSessionStateSchemaV2 = z.object({
  key: z.string(),
  value: z.string(),
});

export type AnswerInSessionState = z.infer<typeof answerInSessionStateSchemaV2>;
