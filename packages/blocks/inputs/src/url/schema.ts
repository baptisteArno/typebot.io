import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";

export const urlInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
    }),
  );

export const urlInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.URL]),
    options: urlInputOptionsSchema.optional(),
  }),
);

export type UrlInputBlock = z.infer<typeof urlInputSchema>;
