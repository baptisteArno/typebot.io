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
import { z } from "@typebot.io/zod";
import { preprocessTypebot } from "../preprocessTypebot";
import { edgeSchema } from "./edge";

export const publicTypebotSchemaV5 = (
  z.preprocess(
    preprocessTypebot,
    z.object({
      id: z.string(),
      version: z.enum(["3", "4", "5"]),
      createdAt: z.date(),
      updatedAt: z.date(),
      lastActivityAt: z.date().nullish(),
      typebotId: z.string(),
      groups: z.array(groupV5Schema),
      events: z.null().openapi({
        type: "array",
      }),
      edges: z.array(edgeSchema),
      variables: z.array(variableSchema),
      theme: themeSchema,
      settings: settingsSchema,
    }),
  ) satisfies z.ZodType<Partial<Prisma.PublicTypebot>, z.ZodTypeDef, unknown>
)._def.schema.openapi({
  ref: "publicTypebotV5",
  title: "Public Typebot V5",
});
export type PublicTypebotV5 = z.infer<typeof publicTypebotSchemaV5>;

export const publicTypebotSchemaV6 = publicTypebotSchemaV5
  .extend({
    version: z.enum(typebotV6Versions),
    groups: z.array(groupV6Schema),
    events: z.tuple([startEventSchema]).rest(draggableEventSchema),
  })
  .openapi({
    ref: "publicTypebotV6",
    title: "Public Typebot V6",
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
