import type { OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { EffectSchemaToJsonSchemaConverter } from "@typebot.io/config/orpc/EffectSchemaToJsonSchemaConverter";
import { convertSchemasListToCommonSchemas } from "@typebot.io/lib/convertSchemasListToCommonSchemas";
import {
  publicTypebotSchemaV5,
  publicTypebotSchemaV6,
} from "@typebot.io/typebot/schemas/publicTypebot";
import { typebotSchema } from "@typebot.io/typebot/schemas/typebot";

export const openApiSchemaConverters = [
  new ZodToJsonSchemaConverter(),
  new EffectSchemaToJsonSchemaConverter(),
];

export const openApiSpecGenerateOptions: OpenAPIGeneratorGenerateOptions = {
  filter: ({ contract }) =>
    Boolean(
      contract["~orpc"].route.method && !contract["~orpc"].route.deprecated,
    ),
  info: {
    title: "Builder API",
    version: "1.0.0",
  },
  servers: [{ url: "https://app.typebot.com/api" }],
  externalDocs: {
    url: "https://docs.typebot.com/api-reference",
  },
  components: {
    securitySchemes: {
      Authorization: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  commonSchemas: {
    ...convertSchemasListToCommonSchemas(typebotSchema),
    PublicTypebotV5: { schema: publicTypebotSchemaV5 },
    PublicTypebotV6: { schema: publicTypebotSchemaV6 },
  },
};
