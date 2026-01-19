import type { z } from "zod";

type ZodObjectAny = z.ZodObject<z.ZodRawShape>;

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

const getShape = (schema: ZodObjectAny) => schema.shape;

const getDiscriminantValues = (schema: z.ZodTypeAny): string[] => {
  if (isZodLiteral(schema))
    return schema.def.values.filter(
      (value): value is string => typeof value === "string",
    );
  if (isZodEnum(schema))
    return schema.options.filter(
      (value): value is string => typeof value === "string",
    );
  return [];
};

export const getDiscriminatedUnionOptionsMap = (
  schema: z.ZodDiscriminatedUnion<readonly ZodObjectAny[], string>,
) => {
  const options = schema.options;
  const discriminant = schema.def.discriminator;
  const map = new Map<string, ZodObjectAny>();

  for (const option of options) {
    const shape = getShape(option);
    const discriminantSchema = shape?.[discriminant];
    if (!isZodType(discriminantSchema)) continue;
    const unwrapped = unwrapSchema(discriminantSchema);
    const values = getDiscriminantValues(unwrapped);
    for (const value of values) map.set(value, option);
  }

  return map;
};

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

const isZodLiteral = (schema: z.ZodTypeAny): schema is z.ZodLiteral =>
  schema.type === "literal";

const isZodEnum = (schema: z.ZodTypeAny): schema is z.ZodEnum =>
  schema.type === "enum";

const isZodType = (value: unknown): value is z.ZodTypeAny =>
  typeof value === "object" &&
  value !== null &&
  "def" in value &&
  "type" in value;
