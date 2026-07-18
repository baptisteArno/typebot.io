import { z } from "zod";
import { preprocessTypebot } from "../preprocessTypebot";
import { publicTypebotSchemaV5, publicTypebotSchemaV6 } from "./publicTypebot";

const typebotVersionEngineVersionSchema = z.preprocess(
  (version) => (version === null || version === undefined ? "3" : version),
  z.union([
    publicTypebotSchemaV5.shape.version,
    publicTypebotSchemaV6.shape.version,
  ]),
);

export const typebotVersionMetadataSchema = z.object({
  id: z.string(),
  typebotId: z.string(),
  versionNumber: z.number().int().positive(),
  version: typebotVersionEngineVersionSchema,
  createdAt: z.coerce.date(),
  createdById: z.string().nullable(),
});
export type TypebotVersionMetadata = z.infer<
  typeof typebotVersionMetadataSchema
>;

export const typebotVersionSchemaV5 = typebotVersionMetadataSchema.extend({
  version: publicTypebotSchemaV5.shape.version,
  groups: publicTypebotSchemaV5.shape.groups,
  events: publicTypebotSchemaV5.shape.events,
  edges: publicTypebotSchemaV5.shape.edges,
  variables: publicTypebotSchemaV5.shape.variables,
  theme: publicTypebotSchemaV5.shape.theme,
  settings: publicTypebotSchemaV5.shape.settings,
});
export type TypebotVersionV5 = z.infer<typeof typebotVersionSchemaV5>;

export const typebotVersionSchemaV6 = typebotVersionMetadataSchema.extend({
  version: publicTypebotSchemaV6.shape.version,
  groups: publicTypebotSchemaV6.shape.groups,
  events: publicTypebotSchemaV6.shape.events,
  edges: publicTypebotSchemaV6.shape.edges,
  variables: publicTypebotSchemaV6.shape.variables,
  theme: publicTypebotSchemaV6.shape.theme,
  settings: publicTypebotSchemaV6.shape.settings,
});
export type TypebotVersionV6 = z.infer<typeof typebotVersionSchemaV6>;

export const typebotVersionSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion("version", [
    typebotVersionSchemaV6,
    typebotVersionSchemaV5,
  ]),
);

export type TypebotVersion = TypebotVersionV6 | TypebotVersionV5;
