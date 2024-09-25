import {
  blockBaseSchema,
  itemBaseSchemas,
} from "@typebot.io/blocks-base/schemas";
import { conditionSchema } from "@typebot.io/conditions/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const conditionItemSchemas = {
  v5: itemBaseSchemas.v5.merge(
    z.object({
      content: conditionSchema.optional(),
    }),
  ),
  v6: itemBaseSchemas.v6.merge(
    z.object({
      content: conditionSchema.optional(),
    }),
  ),
};

export const conditionItemSchema = z.union([
  conditionItemSchemas.v5,
  conditionItemSchemas.v6,
]);

export const conditionBlockSchemas = {
  v5: blockBaseSchema.merge(
    z.object({
      type: z.enum([LogicBlockType.CONDITION]),
      items: z.array(conditionItemSchemas.v5),
      options: z.undefined(),
    }),
  ),
  v6: blockBaseSchema
    .merge(
      z.object({
        type: z.enum([LogicBlockType.CONDITION]),
        items: z.array(conditionItemSchemas.v6),
        options: z.undefined(),
      }),
    )
    .openapi({
      title: "Condition",
      ref: "conditionLogic",
    }),
};

export const conditionBlockSchema = z.union([
  conditionBlockSchemas.v5,
  conditionBlockSchemas.v6,
]);

export type ConditionItem = z.infer<typeof conditionItemSchema>;
export type ConditionBlock = z.infer<typeof conditionBlockSchema>;
