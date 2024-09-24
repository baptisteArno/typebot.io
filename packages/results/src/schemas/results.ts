import type { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { Prisma } from "@typebot.io/prisma/types";
import { variableWithValueSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { answerInputSchema, answerSchema } from "./answers";

export const resultSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  typebotId: z.string(),
  variables: z.array(variableWithValueSchema),
  isCompleted: z.boolean(),
  hasStarted: z.boolean().nullable(),
  isArchived: z.boolean().nullable(),
  lastChatSessionId: z.string().nullable(),
}) satisfies z.ZodType<Prisma.Result>;

export const resultWithAnswersSchema = resultSchema.merge(
  z.object({
    answers: z.array(answerSchema),
  }),
);

export const visitedEdgeSchema = z.object({
  edgeId: z.string(),
  resultId: z.string(),
  index: z.number(),
}) satisfies z.ZodType<Prisma.VisitedEdge>;

export const resultWithAnswersInputSchema = resultSchema.merge(
  z.object({
    answers: z.array(answerInputSchema),
  }),
);

export const logSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  resultId: z.string(),
  status: z.string(),
  description: z.string(),
  details: z.string().nullable(),
}) satisfies z.ZodType<Prisma.Log>;

export type Result = z.infer<typeof resultSchema>;
export type ResultWithAnswers = z.infer<typeof resultWithAnswersSchema>;
export type ResultWithAnswersInput = z.infer<
  typeof resultWithAnswersInputSchema
>;
export type Log = z.infer<typeof logSchema>;

export type ResultValuesInput = Pick<
  ResultWithAnswersInput,
  "answers" | "createdAt" | "variables"
>;

export type ResultValues = Pick<
  ResultWithAnswers,
  "answers" | "createdAt" | "variables"
>;

export type ResultHeaderCell = {
  id: string;
  label: string;
  blocks?: {
    id: string;
    groupId: string;
  }[];
  blockType?: InputBlockType;
  variableIds?: string[];
};

export type CellValueType = { element?: JSX.Element; plainText: string };

export type TableData = {
  id: Pick<CellValueType, "plainText">;
} & Record<string, CellValueType>;
