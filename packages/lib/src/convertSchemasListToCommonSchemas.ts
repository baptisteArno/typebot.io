import type { z } from "zod";

type CommonSchemasResult = Record<string, { schema: z.ZodTypeAny }>;

interface ConvertOptions {
  maxDepth?: number;
  visited?: WeakSet<z.ZodTypeAny>;
}

export const convertSchemasListToCommonSchemas = (
  schema: z.ZodTypeAny,
  options: ConvertOptions = {},
): CommonSchemasResult => {
  const { maxDepth = 10, visited = new WeakSet() } = options;
  const result: CommonSchemasResult = {};

  processSchema(schema, result, { maxDepth, visited }, 0);

  return result;
};

const processSchema = (
  schema: z.ZodTypeAny,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  if (depth > options.maxDepth) return;
  if (options.visited.has(schema)) return;
  options.visited.add(schema);

  const innerSchema = unwrapSchema(schema);
  const typeName = innerSchema._def.typeName;

  switch (typeName) {
    case "ZodDiscriminatedUnion":
      processDiscriminatedUnion(innerSchema, result, options, depth);
      break;
    case "ZodUnion":
      processUnion(innerSchema, result, options, depth);
      break;
    case "ZodObject":
      processObject(innerSchema, result, options, depth);
      break;
    case "ZodArray":
      processSchema(innerSchema._def.type, result, options, depth + 1);
      break;
  }
};

const unwrapSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  const typeName = schema._def.typeName;

  switch (typeName) {
    case "ZodEffects":
      return unwrapSchema(schema._def.schema);
    case "ZodOptional":
    case "ZodNullable":
    case "ZodDefault":
      return unwrapSchema(schema._def.innerType);
    case "ZodLazy":
      return unwrapSchema(schema._def.getter());
    default:
      return schema;
  }
};

const processDiscriminatedUnion = (
  schema: z.ZodTypeAny,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  const discriminator = schema._def.discriminator as string;
  const optionsMap = schema._def.optionsMap as Map<string, z.ZodTypeAny>;

  for (const [discriminantValue, optionSchema] of Array.from(optionsMap)) {
    const key = generateKeyFromDiscriminant(discriminator, discriminantValue);

    if (key && !result[key]) result[key] = { schema: optionSchema };

    processSchema(optionSchema, result, options, depth + 1);
  }
};

const processUnion = (
  schema: z.ZodTypeAny,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  const unionOptions = schema._def.options as z.ZodTypeAny[];

  for (const optionSchema of unionOptions) {
    const unwrapped = unwrapSchema(optionSchema);
    const key = generateKeyFromSchema(unwrapped);

    if (key && !result[key]) result[key] = { schema: unwrapped };

    processSchema(unwrapped, result, options, depth + 1);
  }
};

const processObject = (
  schema: z.ZodTypeAny,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  const shape = schema._def.shape?.() ?? schema._def.shape;
  if (!shape) return;

  for (const propSchema of Object.values(shape))
    processSchema(propSchema as z.ZodTypeAny, result, options, depth + 1);
};

const generateKeyFromDiscriminant = (
  discriminator: string,
  value: unknown,
): string | undefined => {
  if (typeof value !== "string") return undefined;
  if (discriminator === "version") return `V${value}`;
  return toPascalCase(value);
};

const generateKeyFromSchema = (schema: z.ZodTypeAny): string | undefined => {
  if (schema._def.typeName !== "ZodObject") return undefined;

  const shape = schema._def.shape?.() ?? schema._def.shape;
  if (!shape) return undefined;

  const typeField = shape.type;
  if (typeField?._def.typeName === "ZodLiteral") {
    const value = typeField._def.value;
    if (typeof value === "string") return toPascalCase(value);
  }

  if (typeField?._def.typeName === "ZodEnum") {
    const values = typeField._def.values;
    if (values?.length === 1 && typeof values[0] === "string")
      return toPascalCase(values[0]);
  }

  const idField = shape.id;
  if (idField?._def.typeName === "ZodLiteral") {
    const value = idField._def.value;
    if (typeof value === "string") return toPascalCase(value);
  }

  return undefined;
};

const toPascalCase = (str: string): string =>
  str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
