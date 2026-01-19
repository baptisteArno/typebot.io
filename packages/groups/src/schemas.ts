import {
  blockSchemaV5,
  blockSchemaV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { z } from "zod";

export const groupV5Schema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  blocks: z.array(blockSchemaV5),
});
export type GroupV5 = z.infer<typeof groupV5Schema>;

export const groupV6Schema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  blocks: z.array(blockSchemaV6),
});
export type GroupV6 = z.infer<typeof groupV6Schema>;

export type Group = GroupV6 | GroupV5;
