import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";
import { HttpMethod, maxTimeout } from "./constants";

const variableForTestSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  value: z.string().optional(),
});

const responseVariableMappingSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  bodyPath: z.string().optional(),
});

const keyValueSchema = z.object({
  id: z.string(),
  key: z.string().optional(),
  value: z.string().optional(),
});

export const httpRequestV5Schema = z.object({
  id: z.string(),
  queryParams: keyValueSchema.array().optional(),
  headers: keyValueSchema.array().optional(),
  method: z.nativeEnum(HttpMethod).optional(),
  url: z.string().optional(),
  body: z.string().optional(),
});

const httpRequestSchemas = {
  v5: httpRequestV5Schema,
  v6: httpRequestV5Schema
    .omit({
      id: true,
    })
    .openapi({
      title: "HTTP Request",
      ref: "httpRequestBlock",
    }),
};

const httpRequestSchema = z.union([
  httpRequestSchemas.v5,
  httpRequestSchemas.v6,
]);

export const httpRequestOptionsV5Schema = z.object({
  variablesForTest: z.array(variableForTestSchema).optional(),
  responseVariableMapping: z.array(responseVariableMappingSchema).optional(),
  isAdvancedConfig: z.boolean().optional(),
  isCustomBody: z.boolean().optional(),
  isExecutedOnClient: z.boolean().optional(),
  webhook: httpRequestSchemas.v5.optional(),
  timeout: z.number().min(1).max(maxTimeout).optional(),
});

const httpRequestOptionsSchemas = {
  v5: httpRequestOptionsV5Schema,
  v6: httpRequestOptionsV5Schema.merge(
    z.object({
      webhook: httpRequestSchemas.v6.optional(),
    }),
  ),
};

const httpBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z
      .enum([IntegrationBlockType.WEBHOOK])
      .describe("Legacy name for HTTP Request block"),
    options: httpRequestOptionsSchemas.v5.optional(),
    webhookId: z.string().optional(),
  }),
);

export const httpBlockSchemas = {
  v5: httpBlockV5Schema,
  v6: httpBlockV5Schema
    .omit({
      webhookId: true,
    })
    .merge(
      z.object({
        options: httpRequestOptionsSchemas.v6.optional(),
      }),
    ),
};

const httpBlockSchema = z.union([httpBlockSchemas.v5, httpBlockSchemas.v6]);

export const executableHttpRequestSchema = z.object({
  url: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  method: z.nativeEnum(HttpMethod).optional(),
});

export type KeyValue = { id: string; key?: string; value?: string };

export type HttpResponse = {
  statusCode: number;
  data?: unknown;
};

export type ExecutableHttpRequest = z.infer<typeof executableHttpRequestSchema>;

export type HttpRequest = z.infer<typeof httpRequestSchema>;
export type HttpRequestBlock = z.infer<typeof httpBlockSchema>;
export type HttpRequestBlockV6 = z.infer<typeof httpBlockSchemas.v6>;
export type ResponseVariableMapping = z.infer<
  typeof responseVariableMappingSchema
>;
export type VariableForTest = z.infer<typeof variableForTestSchema>;
