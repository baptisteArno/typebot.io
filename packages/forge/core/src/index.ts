import { variableStringSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import type { ZodLayoutMetadata } from "@typebot.io/zod";
import type {
  ActionDefinition,
  AuthDefinition,
  BlockDefinition,
} from "./types";

export const createAuth = <
  A extends {
    type: "encryptedCredentials";
    name: string;
    schema: z.ZodObject<any>;
  },
>(
  authDefinition: A,
) => authDefinition;

export const createBlock = <
  Id extends string,
  A extends AuthDefinition,
  O extends z.ZodObject<any>,
>(
  blockDefinition: BlockDefinition<Id, A, O>,
): BlockDefinition<Id, A, O> => blockDefinition;

export const createVersionedBlock = <
  Blocks extends Record<
    string,
    BlockDefinition<string, AuthDefinition, z.ZodObject<any>>
  >,
>(
  blocks: Blocks,
): Blocks => blocks;

export const createAction = <
  A extends AuthDefinition,
  BaseOptions extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
  O extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
>(
  actionDefinition: {
    auth?: A;
    baseOptions?: BaseOptions;
  } & ActionDefinition<A, BaseOptions, O>,
) => actionDefinition;

export const parseBlockSchema = <
  I extends string,
  A extends AuthDefinition,
  O extends z.ZodObject<any>,
>(
  blockDefinition: BlockDefinition<I, A, O>,
) => {
  const options = z.discriminatedUnion("action", [
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
            .merge(action.options ?? z.object({})),
    ),
  ]);
  return z
    .object({
      id: z.string(),
      outgoingEdgeId: z.string().optional(),
      type: z.literal(blockDefinition.id),
      options: options.optional(),
    })
    .openapi({
      title: blockDefinition.name,
      ref: `${blockDefinition.id}Block`,
    });
};

export const parseBlockCredentials = <
  I extends string,
  A extends z.ZodObject<any>,
>(
  blockId: I,
  authSchema: A,
) => {
  return z.object({
    id: z.string(),
    type: z.literal(blockId),
    createdAt: z.date(),
    workspaceId: z.string(),
    name: z.string(),
    iv: z.string(),
    data: authSchema,
  });
};

export const option = {
  object: <T extends z.ZodRawShape>(schema: T) => z.object(schema),
  literal: <T extends string>(value: T) => z.literal(value),
  string: z.string().optional(),
  boolean: z.boolean().optional(),
  enum: <T extends string>(values: readonly [T, ...T[]]) =>
    z.enum(values).optional(),
  number: z.number().or(variableStringSchema).optional(),
  array: <T extends z.ZodTypeAny>(schema: T) => z.array(schema).optional(),
  discriminatedUnion: <
    T extends string,
    J extends [
      z.ZodDiscriminatedUnionOption<T>,
      ...z.ZodDiscriminatedUnionOption<T>[],
    ],
  >(
    field: T,
    schemas: J,
  ) =>
    // @ts-expect-error
    z.discriminatedUnion<T, J>(field, [
      z.object({ [field]: z.undefined() }),
      ...schemas,
    ]),
  saveResponseArray: <I extends readonly [string, ...string[]]>(
    items: I,
    layouts?: {
      item?: ZodLayoutMetadata<z.ZodTypeAny>;
      variableId?: ZodLayoutMetadata<z.ZodTypeAny>;
    },
  ) =>
    z
      .array(
        z.object({
          item: z
            .enum(items)
            .optional()
            .layout({
              ...(layouts?.item ?? {}),
              placeholder: "Select a response",
              defaultValue: items[0],
            }),
          variableId: z
            .string()
            .optional()
            .layout({
              ...(layouts?.variableId ?? {}),
              inputType: "variableDropdown",
            }),
        }),
      )
      .optional(),
  filter: ({
    operators = defaultFilterOperators,
    isJoinerHidden,
  }: {
    operators?: readonly [string, ...string[]];
    isJoinerHidden: (currentObj: Record<string, any>) => boolean;
  }) =>
    z
      .object({
        comparisons: z.array(
          z.object({
            input: z.string().optional().layout({ label: "Enter a field " }),
            operator: z
              .enum(operators)
              .optional()
              .layout({ defaultValue: "Equal to" }),
            value: z
              .string()
              .optional()
              .layout({ placeholder: "Enter a value" }),
          }),
        ),
        joiner: z.enum(["AND", "OR"]).optional().layout({
          placeholder: "Select joiner",
          isHidden: isJoinerHidden,
        }),
      })
      .optional(),
};

const defaultFilterOperators = [
  "Equal to",
  "Not equal",
  "Contains",
  "Does not contain",
  "Greater than",
  "Less than",
  "Is set",
  "Is empty",
  "Starts with",
  "Ends with",
  "Matches regex",
  "Does not match regex",
] as const;
