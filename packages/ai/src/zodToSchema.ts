import { jsonSchema, type Schema } from "ai";
import type { z } from "zod";

type JSONSchema7 = Parameters<typeof jsonSchema>[0];

export const zodToSchema = <T extends z.ZodTypeAny>(
  schema: T,
): Schema<z.infer<T>> =>
  jsonSchema(assertJsonSchema7(schema.toJSONSchema({ target: "draft-07" })), {
    validate: (value) => {
      const result = schema.safeParse(value);
      if (result.success) return { success: true, value: result.data };
      return { success: false, error: result.error };
    },
  });

const assertJsonSchema7 = (schema: unknown): JSONSchema7 => {
  if (isJsonSchema7(schema)) return schema;
  throw new Error("Failed to convert Zod schema to JSON Schema draft-07");
};

const isJsonSchema7 = (schema: unknown): schema is JSONSchema7 => {
  if (typeof schema === "boolean") return true;
  if (!isRecord(schema)) return false;
  const exclusiveMaximum = schema.exclusiveMaximum;
  if (typeof exclusiveMaximum === "boolean") return false;
  const exclusiveMinimum = schema.exclusiveMinimum;
  if (typeof exclusiveMinimum === "boolean") return false;
  return true;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
