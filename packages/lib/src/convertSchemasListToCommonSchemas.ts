import { z } from "zod";

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

  if (isZodDiscriminatedUnion(innerSchema)) {
    processDiscriminatedUnion(innerSchema, result, options, depth);
    return;
  }

  if (isZodUnion(innerSchema)) {
    processUnion(innerSchema, result, options, depth);
    return;
  }

  if (isZodObject(innerSchema)) {
    processObject(innerSchema, result, options, depth);
    return;
  }

  if (isZodArray(innerSchema))
    processSchema(innerSchema.element, result, options, depth + 1);
};

const unwrapSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (isZodWrapper(schema)) return unwrapSchema(schema.unwrap());

  if (isZodPipe(schema)) {
    const inSchema = schema.in;
    const outSchema = schema.out;
    const targetSchema = isZodTransform(inSchema)
      ? outSchema
      : isZodTransform(outSchema)
        ? inSchema
        : (inSchema ?? outSchema);
    return targetSchema ? unwrapSchema(targetSchema) : schema;
  }

  if (isZodLazy(schema)) return unwrapSchema(schema.unwrap());
  return schema;
};

const processDiscriminatedUnion = (
  schema: z.ZodDiscriminatedUnion<readonly ZodObjectAny[], string>,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  const discriminator = schema.def.discriminator;

  for (const optionSchema of schema.options) {
    const shape = getObjectShape(optionSchema);
    const discriminantSchema = shape?.[discriminator];
    if (!isZodType(discriminantSchema)) continue;
    const unwrapped = unwrapSchema(discriminantSchema);
    for (const value of getLiteralValues(unwrapped)) {
      const key = generateKeyFromDiscriminant(discriminator, value);
      if (key && !result[key]) result[key] = { schema: optionSchema };
    }

    processSchema(optionSchema, result, options, depth + 1);
  }
};

const processUnion = (
  schema: z.ZodUnion<readonly z.ZodTypeAny[]>,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  for (const optionSchema of schema.options) {
    const unwrapped = unwrapSchema(optionSchema);
    const key = generateKeyFromSchema(unwrapped);

    if (key && !result[key]) result[key] = { schema: unwrapped };

    processSchema(unwrapped, result, options, depth + 1);
  }
};

const processObject = (
  schema: ZodObjectAny,
  result: CommonSchemasResult,
  options: Required<ConvertOptions>,
  depth: number,
): void => {
  const shape = getObjectShape(schema);
  if (!shape) return;

  for (const propSchema of Object.values(shape)) {
    if (!isZodType(propSchema)) continue;
    processSchema(propSchema, result, options, depth + 1);
  }
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
  if (!isZodObject(schema)) return undefined;

  const shape = getObjectShape(schema);
  if (!shape) return undefined;

  const typeField = isZodType(shape.type)
    ? unwrapSchema(shape.type)
    : undefined;
  if (typeField && isZodLiteral(typeField)) {
    const value = typeField.def.values[0];
    if (typeof value === "string") return toPascalCase(value);
  }

  if (typeField && isZodEnum(typeField)) {
    const values = typeField.options.filter(isString);
    if (values.length === 1) return toPascalCase(values[0]);
  }

  const idField = isZodType(shape.id) ? unwrapSchema(shape.id) : undefined;
  if (idField && isZodLiteral(idField)) {
    const value = idField.def.values[0];
    if (typeof value === "string") return toPascalCase(value);
  }

  return undefined;
};

const getObjectShape = (schema: z.ZodTypeAny): z.ZodRawShape | undefined => {
  if (!isZodObject(schema)) return undefined;
  return schema.shape;
};

const getLiteralValues = (schema: z.ZodTypeAny) => {
  if (isZodLiteral(schema)) return schema.def.values.filter(isString);
  if (isZodEnum(schema)) return schema.options.filter(isString);
  return [];
};

const toPascalCase = (str: string): string =>
  str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

type ZodObjectAny = z.ZodObject<z.ZodRawShape>;

const isString = (value: unknown): value is string => typeof value === "string";

const isZodWrapper = (
  schema: z.ZodTypeAny,
): schema is
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodNullable<z.ZodTypeAny>
  | z.ZodDefault<z.ZodTypeAny>
  | z.ZodCatch<z.ZodTypeAny>
  | z.ZodReadonly<z.ZodTypeAny> =>
  schema.type === "optional" ||
  schema.type === "nullable" ||
  schema.type === "default" ||
  schema.type === "catch" ||
  schema.type === "readonly";

const isZodPipe = (
  schema: z.ZodTypeAny,
): schema is z.ZodPipe<z.ZodTypeAny, z.ZodTypeAny> => schema.type === "pipe";

const isZodLazy = (schema: z.ZodTypeAny): schema is z.ZodLazy<z.ZodTypeAny> =>
  schema.type === "lazy";

const isZodTransform = (
  schema: z.ZodTypeAny | undefined,
): schema is z.ZodTransform => schema?.type === "transform";

const isZodDiscriminatedUnion = (
  schema: z.ZodTypeAny,
): schema is z.ZodDiscriminatedUnion<readonly ZodObjectAny[], string> =>
  schema instanceof z.ZodDiscriminatedUnion;

const isZodUnion = (
  schema: z.ZodTypeAny,
): schema is z.ZodUnion<readonly z.ZodTypeAny[]> =>
  schema instanceof z.ZodUnion;

const isZodObject = (schema: z.ZodTypeAny): schema is ZodObjectAny =>
  schema instanceof z.ZodObject;

const isZodArray = (schema: z.ZodTypeAny): schema is z.ZodArray<z.ZodTypeAny> =>
  schema instanceof z.ZodArray;

const isZodLiteral = (schema: z.ZodTypeAny): schema is z.ZodLiteral =>
  schema.type === "literal";

const isZodEnum = (schema: z.ZodTypeAny): schema is z.ZodEnum =>
  schema.type === "enum";

const isZodType = (value: unknown): value is z.ZodTypeAny =>
  typeof value === "object" &&
  value !== null &&
  "def" in value &&
  "type" in value;
