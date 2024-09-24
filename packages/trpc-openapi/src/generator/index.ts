import type { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import {
  type ZodOpenApiObject,
  type ZodOpenApiPathsObject,
  createDocument,
} from "zod-openapi";

import type { OpenApiRouter } from "../types";
import { getOpenApiPathsObject, mergePaths } from "./paths";

export type GenerateOpenApiDocumentOptions = {
  title: string;
  description?: string;
  version: string;
  openApiVersion?: ZodOpenApiObject["openapi"];
  baseUrl: string;
  docsUrl?: string;
  tags?: string[];
  securitySchemes?: Record<string, SecuritySchemeObject>;
  paths?: ZodOpenApiPathsObject;
};

export const generateOpenApiDocument = (
  appRouter: OpenApiRouter,
  opts: GenerateOpenApiDocumentOptions,
): OpenAPIObject => {
  const securitySchemes = opts.securitySchemes || {
    Authorization: {
      type: "http",
      scheme: "bearer",
    },
  };
  return createDocument({
    openapi: opts.openApiVersion ?? "3.0.3",
    info: {
      title: opts.title,
      description: opts.description,
      version: opts.version,
    },
    servers: [
      {
        url: opts.baseUrl,
      },
    ],
    paths: mergePaths(
      getOpenApiPathsObject(appRouter, Object.keys(securitySchemes)),
      opts.paths,
    ),
    components: {
      securitySchemes,
    },
    tags: opts.tags?.map((tag) => ({ name: tag })),
    externalDocs: opts.docsUrl ? { url: opts.docsUrl } : undefined,
  });
};
