import type { ProcedureType } from "@trpc/server";
import { type AnyZodObject, z } from "zod";

import type {
  OpenApiMeta,
  OpenApiProcedure,
  OpenApiProcedureRecord,
  Parser,
} from "../types";

const mergeInputs = (inputParsers: AnyZodObject[]): AnyZodObject => {
  return inputParsers.reduce((acc, inputParser) => {
    return acc.merge(inputParser);
  }, z.object({}));
};

// `inputParser` & `outputParser` are private so this is a hack to access it
export const getInputOutputParsers = (
  procedure: OpenApiProcedure,
): {
  inputParser: AnyZodObject | Parser | undefined;
  outputParser: Parser | undefined;
} => {
  const { inputs, output } = procedure._def;
  return {
    inputParser:
      inputs.length >= 2 ? mergeInputs(inputs as AnyZodObject[]) : inputs[0],
    outputParser: output,
  };
};

const getProcedureType = (procedure: OpenApiProcedure): ProcedureType => {
  if (procedure._def.query) return "query";
  if (procedure._def.mutation) return "mutation";
  if (procedure._def.subscription) return "subscription";
  throw new Error("Unknown procedure type");
};

export const forEachOpenApiProcedure = (
  procedureRecord: OpenApiProcedureRecord,
  callback: (values: {
    path: string;
    type: ProcedureType;
    procedure: OpenApiProcedure;
    openapi: NonNullable<OpenApiMeta["openapi"]>;
  }) => void,
) => {
  for (const [path, procedure] of Object.entries(procedureRecord)) {
    const { openapi } = procedure._def.meta ?? {};
    if (openapi && openapi.enabled !== false) {
      const type = getProcedureType(procedure);
      callback({ path, type, procedure, openapi });
    }
  }
};
