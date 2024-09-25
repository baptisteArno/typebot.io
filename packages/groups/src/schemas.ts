import {
  blockSchemaV5,
  blockSchemaV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { z } from "@typebot.io/zod";

export const groupV5Schema = z.object({
  id: z.string(),
  title: z.string(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
  blocks: z.array(blockSchemaV5),
});
type GroupV5 = z.infer<typeof groupV5Schema>;

export const groupV6Schema = z
  .object({
    id: z.string(),
    title: z.string(),
    graphCoordinates: z.object({
      x: z.number(),
      y: z.number(),
    }),
    blocks: z.array(blockSchemaV6),
  })
  .openapi({
    title: "Group V6",
    ref: "groupV6",
  });
export type GroupV6 = z.infer<typeof groupV6Schema>;

export type Group = GroupV6 | GroupV5;

export const parseGroups = <T extends string | null>(
  groups: unknown,
  { typebotVersion }: { typebotVersion: T },
): T extends "6" ? GroupV6[] : GroupV5[] => {
  if (typebotVersion === "6") {
    return z.array(groupV6Schema).parse(groups) as T extends "6"
      ? GroupV6[]
      : GroupV5[];
  }
  return z.array(groupV5Schema).parse(groups) as T extends "6"
    ? GroupV6[]
    : GroupV5[];
};
