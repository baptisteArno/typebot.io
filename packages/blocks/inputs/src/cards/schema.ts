import {
  blockBaseSchema,
  itemBaseSchemas,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { conditionSchema } from "@typebot.io/conditions/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { cardMappableFields } from "./constants";

const cardsOptionsSchema = optionBaseSchema.extend({
  saveResponseMapping: z
    .array(
      z.object({
        field: z.enum(cardMappableFields).optional(),
        variableId: z.string().optional(),
      }),
    )
    .optional(),
});

const cardsItemPathSchema = z.object({
  id: z.string(),
  text: z.string().optional(),
  outgoingEdgeId: z.string().optional(),
});
export type CardsItemPath = z.infer<typeof cardsItemPathSchema>;

export const cardsItemSchema = itemBaseSchemas.v6.extend({
  options: z
    .object({
      displayCondition: z
        .object({
          isEnabled: z.boolean().optional(),
          condition: conditionSchema.optional(),
        })
        .optional(),
      internalValue: z.string().nullish(),
    })
    .optional(),
  imageUrl: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  paths: z.array(cardsItemPathSchema).optional(),
});
export type CardsItem = z.infer<typeof cardsItemSchema>;

export const cardsBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.CARDS),
    items: z.array(cardsItemSchema),
    options: cardsOptionsSchema.optional(),
  }),
);
export type CardsBlock = z.infer<typeof cardsBlockSchema>;
