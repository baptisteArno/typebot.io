import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const returnBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.RETURN]),
  }),
);

export type ReturnBlock = z.infer<typeof returnBlockSchema>;
