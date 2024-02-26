import { z } from '@typebot.io/forge/zod'

export const getZodInnerSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (schema._def.typeName === 'ZodEffects')
    return getZodInnerSchema(schema._def.schema)
  if (schema._def.typeName === 'ZodOptional') {
    const innerSchema = getZodInnerSchema(schema._def.innerType)
    return {
      ...innerSchema,
      _def: {
        ...innerSchema._def,
        layout: schema._def.layout,
      },
    } as z.ZodTypeAny
  }

  return schema
}
