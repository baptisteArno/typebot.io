import { groupV5Schema, groupV6Schema } from "@typebot.io/groups/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { themeSchema } from "@typebot.io/theme/schemas";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import {
  preprocessColumnsWidthResults,
  preprocessTypebot,
} from "../preprocessTypebot";
import { edgeSchema } from "./edge";
import { startEventSchema } from "./events/start/schema";

export const resultsTablePreferencesSchema = z.object({
  columnsOrder: z.array(z.string()),
  columnsVisibility: z.record(z.string(), z.boolean()),
  columnsWidth: z.preprocess(
    preprocessColumnsWidthResults,
    z.record(z.string(), z.number()),
  ),
});

const isDomainNameWithPathNameCompatible = (str: string) =>
  /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[\w-\/]*)?)$/.test(
    str,
  );

export const typebotV5Schema = z
  .preprocess(
    preprocessTypebot,
    z.object({
      version: z.enum(["3", "4", "5"]),
      id: z.string(),
      name: z.string(),
      events: z
        .preprocess((val) => (val === undefined ? null : val), z.null())
        .openapi({ type: "array" }),
      groups: z.array(groupV5Schema),
      edges: z.array(edgeSchema),
      variables: z.array(variableSchema),
      theme: themeSchema,
      selectedThemeTemplateId: z.string().nullable(),
      settings: settingsSchema,
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      icon: z.string().nullable(),
      folderId: z.string().nullable(),
      publicId: z
        .string()
        .refine((str) => /^[a-zA-Z0-9-.]+$/.test(str))
        .nullable(),
      customDomain: z
        .string()
        .refine(isDomainNameWithPathNameCompatible)
        .nullable(),
      workspaceId: z.string(),
      resultsTablePreferences: resultsTablePreferencesSchema.nullable(),
      isArchived: z.boolean(),
      isClosed: z.boolean(),
      whatsAppCredentialsId: z.string().nullable(),
      riskLevel: z.number().nullable(),
    }) satisfies z.ZodType<Prisma.Typebot, z.ZodTypeDef, unknown>,
  )
  ._def.schema.openapi({
    title: "Typebot V5",
    ref: "typebotV5",
  });
export type TypebotV5 = z.infer<typeof typebotV5Schema>;

export const typebotV6Schema = typebotV5Schema
  .extend({
    version: z.literal("6"),
    groups: z.array(groupV6Schema),
    events: z.tuple([startEventSchema]),
  })
  .openapi({
    title: "Typebot V6",
    ref: "typebotV6",
  });
export type TypebotV6 = z.infer<typeof typebotV6Schema>;

export const typebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion("version", [typebotV6Schema, typebotV5Schema]),
);

export type Typebot = TypebotV5 | TypebotV6;

export type ResultsTablePreferences = z.infer<
  typeof resultsTablePreferencesSchema
>;
