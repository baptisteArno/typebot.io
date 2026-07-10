import type { OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  audioMessageSchema,
  commandMessageSchema,
  startFromEventSchema,
  startFromGroupSchema,
  textMessageSchema,
} from "@typebot.io/chat-api/schemas";
import { EffectSchemaToJsonSchemaConverter } from "@typebot.io/config/orpc/EffectSchemaToJsonSchemaConverter";

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
    title: "Chat API",
    version: "3.0.0",
  },
  servers: [{ url: "https://typebot.io/api" }],
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
    Text: {
      schema: textMessageSchema,
    },
    Audio: {
      schema: audioMessageSchema,
    },
    Command: {
      schema: commandMessageSchema,
    },
    Group: {
      schema: startFromGroupSchema,
    },
    Event: {
      schema: startFromEventSchema,
    },
  },
};
