import type { z } from "zod";

export const getZodInnerSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (isZodWrapper(schema)) {
    const innerSchema = getZodInnerSchema(schema.unwrap());
    return mergeLayoutMeta(schema, innerSchema);
  }

  if (isZodPipe(schema)) {
    const inSchema = schema.in;
    const outSchema = schema.out;
    const targetSchema = isZodTransform(inSchema)
      ? outSchema
      : isZodTransform(outSchema)
        ? inSchema
        : (inSchema ?? outSchema);
    if (!targetSchema) return schema;
    const innerSchema = getZodInnerSchema(targetSchema);
    return mergeLayoutMeta(schema, innerSchema);
  }

  if (isZodLazy(schema)) {
    const innerSchema = getZodInnerSchema(schema.unwrap());
    return mergeLayoutMeta(schema, innerSchema);
  }

  return schema;
};

const mergeLayoutMeta = (source: z.ZodTypeAny, target: z.ZodTypeAny) => {
  const layout = source.meta?.()?.layout;
  if (!layout) return target;
  const innerMeta = target.meta?.();
  return target.meta({
    ...(innerMeta ?? {}),
    layout,
  });
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
