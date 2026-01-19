import {
  draggableEventSchema,
  startEventSchema,
} from "@typebot.io/events/schemas";
import { groupV5Schema, groupV6Schema } from "@typebot.io/groups/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import { typebotV6Versions } from "@typebot.io/schemas/versions";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { themeSchema } from "@typebot.io/theme/schemas";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";
import { preprocessTypebot } from "../preprocessTypebot";
import { edgeSchema } from "./edge";

export const publicTypebotSchemaV5 = z.object({
  id: z.string(),
  version: z.enum(["3", "4", "5"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActivityAt: z.date().nullish(),
  typebotId: z.string(),
  groups: z.array(groupV5Schema),
  events: z.null(),
  edges: z.array(edgeSchema),
  variables: z.array(variableSchema),
  theme: themeSchema,
  settings: settingsSchema,
}) satisfies z.ZodType<Partial<Prisma.PublicTypebot>>;
export type PublicTypebotV5 = z.infer<typeof publicTypebotSchemaV5>;

export const publicTypebotSchemaV6 = publicTypebotSchemaV5.extend({
  version: z.enum(typebotV6Versions),
  groups: z.array(groupV6Schema),
  events: z.tuple([startEventSchema]).rest(draggableEventSchema),
});
export type PublicTypebotV6 = z.infer<typeof publicTypebotSchemaV6>;

export const publicTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion("version", [
    publicTypebotSchemaV6,
    publicTypebotSchemaV5,
  ]),
);

export type PublicTypebot = PublicTypebotV6 | PublicTypebotV5;
