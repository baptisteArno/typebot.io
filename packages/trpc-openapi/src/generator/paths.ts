import { TRPCError } from "@trpc/server";
import cloneDeep from "lodash.clonedeep";
import { z } from "zod";
import {
  type ZodOpenApiParameters,
  type ZodOpenApiPathsObject,
  type ZodOpenApiRequestBodyObject,
  extendZodWithOpenApi,
} from "zod-openapi";

import type { OpenApiProcedureRecord, OpenApiRouter } from "../types";
import { acceptsRequestBody } from "../utils/method";
import { getPathParameters, normalizePath } from "../utils/path";
import {
  forEachOpenApiProcedure,
  getInputOutputParsers,
} from "../utils/procedure";
import {
  instanceofZodType,
  instanceofZodTypeLikeVoid,
  instanceofZodTypeObject,
  unwrapZodType,
} from "../utils/zod";
import {
  getParameterObjects,
  getRequestBodyObject,
  getResponsesObject,
  hasInputs,
} from "./schema";

extendZodWithOpenApi(z);

export enum HttpMethods {
  GET = "get",
  POST = "post",
  PATCH = "patch",
  PUT = "put",
  DELETE = "delete",
}

export const getOpenApiPathsObject = (
  appRouter: OpenApiRouter,
  securitySchemeNames: string[],
): ZodOpenApiPathsObject => {
  const pathsObject: ZodOpenApiPathsObject = {};
  const procedures = cloneDeep(
    appRouter._def.procedures as OpenApiProcedureRecord,
  );

  forEachOpenApiProcedure(
    procedures,
    ({ path: procedurePath, type, procedure, openapi }) => {
      const procedureName = `${type}.${procedurePath}`;

      try {
        if (type === "subscription") {
          throw new TRPCError({
            message: "Subscriptions are not supported by OpenAPI v3",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const {
          method,
          protect,
          summary,
          description,
          tags,
          requestHeaders,
          responseHeaders,
          successDescription,
          errorResponses,
        } = openapi;

        const path = normalizePath(openapi.path);
        const pathParameters = getPathParameters(path);

        const httpMethod = HttpMethods[method];
        if (!httpMethod) {
          throw new TRPCError({
            message: "Method must be GET, POST, PATCH, PUT or DELETE",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        if (pathsObject[path]?.[httpMethod]) {
          throw new TRPCError({
            message: `Duplicate procedure defined for route ${method} ${path}`,
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const contentTypes = openapi.contentTypes || ["application/json"];
        if (contentTypes.length === 0) {
          throw new TRPCError({
            message: "At least one content type must be specified",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const { inputParser, outputParser } = getInputOutputParsers(procedure);

        if (!instanceofZodType(inputParser)) {
          throw new TRPCError({
            message: "Input parser expects a Zod validator",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        if (!instanceofZodType(outputParser)) {
          throw new TRPCError({
            message: "Output parser expects a Zod validator",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        const isInputRequired = !inputParser.isOptional();
        const o = inputParser?._def?.openapi;
        const inputSchema = unwrapZodType(inputParser, true).openapi({
          ...(o?.title ? { title: o?.title } : {}),
          ...(o?.description ? { description: o?.description } : {}),
        });

        const requestData: {
          requestBody?: ZodOpenApiRequestBodyObject;
          requestParams?: ZodOpenApiParameters;
        } = {};
        if (
          !(
            pathParameters.length === 0 &&
            instanceofZodTypeLikeVoid(inputSchema)
          )
        ) {
          if (!instanceofZodTypeObject(inputSchema)) {
            throw new TRPCError({
              message: "Input parser must be a ZodObject",
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          if (acceptsRequestBody(method)) {
            requestData.requestBody = getRequestBodyObject(
              inputSchema,
              isInputRequired,
              pathParameters,
              contentTypes,
            );
            requestData.requestParams =
              getParameterObjects(
                inputSchema,
                isInputRequired,
                pathParameters,
                requestHeaders,
                "path",
              ) || {};
          } else {
            requestData.requestParams =
              getParameterObjects(
                inputSchema,
                isInputRequired,
                pathParameters,
                requestHeaders,
                "all",
              ) || {};
          }
        }

        const responses = getResponsesObject(
          outputParser,
          httpMethod,
          responseHeaders,
          protect ?? false,
          hasInputs(inputParser),
          successDescription,
          errorResponses,
        );

        const security = protect
          ? securitySchemeNames.map((name) => ({ [name]: [] }))
          : undefined;

        pathsObject[path] = {
          ...pathsObject[path],
          [httpMethod]: {
            operationId: procedurePath.replace(/\./g, "-"),
            summary,
            description,
            tags,
            security,
            ...requestData,
            responses,
            ...(openapi.deprecated ? { deprecated: openapi.deprecated } : {}),
          },
        };
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        error.message = `[${procedureName}] - ${error.message}`;
        throw error;
      }
    },
  );

  return pathsObject;
};

export const mergePaths = (
  x?: ZodOpenApiPathsObject,
  y?: ZodOpenApiPathsObject,
) => {
  if (x === undefined) return y;
  if (y === undefined) return x;
  const obj: ZodOpenApiPathsObject = x;
  for (const [k, v] of Object.entries(y)) {
    if (k in obj) obj[k] = { ...obj[k], ...v };
    else obj[k] = v;
  }
  return obj;
};
