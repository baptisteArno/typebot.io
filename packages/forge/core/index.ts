import { ZodRawShape } from 'zod'
import { AuthDefinition, BlockDefinition, ActionDefinition } from './types'
import { z } from './zod'

export const variableStringSchema = z.custom<`{{${string}}}`>((val) =>
  /^{{.+}}$/g.test(val as string)
)

export const createAuth = <A extends AuthDefinition>(authDefinition: A) =>
  authDefinition

export const createBlock = <
  Id extends string,
  A extends AuthDefinition,
  O extends z.ZodObject<any>
>(
  blockDefinition: BlockDefinition<Id, A, O>
): BlockDefinition<Id, A, O> => blockDefinition

export const createVersionedBlock = <
  Blocks extends Record<
    string,
    BlockDefinition<string, AuthDefinition, z.ZodObject<any>>
  >
>(
  blocks: Blocks
): Blocks => blocks

export const createAction = <
  A extends AuthDefinition,
  BaseOptions extends z.ZodObject<ZodRawShape> = z.ZodObject<{}>,
  O extends z.ZodObject<ZodRawShape> = z.ZodObject<{}>
>(
  actionDefinition: {
    auth?: A
    baseOptions?: BaseOptions
  } & ActionDefinition<A, BaseOptions, O>
) => actionDefinition

export const parseBlockSchema = <
  I extends string,
  A extends AuthDefinition,
  O extends z.ZodObject<any>
>(
  blockDefinition: BlockDefinition<I, A, O>
) => {
  const options = z.discriminatedUnion('action', [
    blockDefinition.options
      ? blockDefinition.options.extend({
          credentialsId: z.string().optional(),
          action: z.undefined(),
        })
      : z.object({
          credentialsId: z.string().optional(),
          action: z.undefined(),
        }),
    ...blockDefinition.actions.map((action) =>
      blockDefinition.options
        ? (blockDefinition.options
            .extend({
              credentialsId: z.string().optional(),
            })
            .extend({
              action: z.literal(action.name),
            })
            .merge(action.options ?? z.object({})) as any)
        : z
            .object({
              credentialsId: z.string().optional(),
            })
            .extend({
              action: z.literal(action.name),
            })
            .merge(action.options ?? z.object({}))
    ),
  ])
  return z.object({
    id: z.string(),
    outgoingEdgeId: z.string().optional(),
    type: z.literal(blockDefinition.id),
    options: options.optional(),
  })
}

export const parseBlockCredentials = <
  I extends string,
  A extends AuthDefinition,
  O extends z.ZodObject<any>
>(
  blockDefinition: BlockDefinition<I, A, O>
) => {
  if (!blockDefinition.auth) throw new Error('Block has no auth definition')
  return z.object({
    id: z.string(),
    type: z.literal(blockDefinition.id),
    createdAt: z.date(),
    workspaceId: z.string(),
    name: z.string(),
    iv: z.string(),
    data: blockDefinition.auth.schema,
  })
}

export const option = {
  object: <T extends z.ZodRawShape>(schema: T) => z.object(schema),
  literal: <T extends string>(value: T) => z.literal(value),
  string: z.string().optional(),
  boolean: z.boolean().optional(),
  enum: <T extends string>(values: readonly [T, ...T[]]) =>
    z.enum(values).optional(),
  number: z.number().or(variableStringSchema).optional(),
  array: <T extends z.ZodTypeAny>(schema: T) => z.array(schema).optional(),
  keyValueList: z
    .array(
      z.object({
        key: z.string().optional().layout({
          label: 'Key',
        }),
        value: z.string().optional().layout({
          label: 'Value',
        }),
      })
    )
    .optional(),
  discriminatedUnion: <
    T extends string,
    J extends [
      z.ZodDiscriminatedUnionOption<T>,
      ...z.ZodDiscriminatedUnionOption<T>[]
    ]
  >(
    field: T,
    schemas: J
  ) =>
    // @ts-expect-error
    z.discriminatedUnion<T, J>(field, [
      z.object({ [field]: z.undefined() }),
      ...schemas,
    ]),
  saveResponseArray: <I extends readonly [string, ...string[]]>(items: I) =>
    z
      .array(
        z.object({
          item: z.enum(items).optional().layout({
            placeholder: 'Select a response',
            defaultValue: items[0],
          }),
          variableId: z.string().optional().layout({
            inputType: 'variableDropdown',
          }),
        })
      )
      .optional(),
}

export type * from './types'
