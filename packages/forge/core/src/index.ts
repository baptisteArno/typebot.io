import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";
import type {
  ActionDefinition,
  ActionHandler,
  AuthDefinition,
  BlockDefinition,
  FetcherHandler,
} from "./types";
import type { ZodLayoutMetadata } from "./zodLayout";

export const createAuth = <T extends AuthDefinition<any>>(authDefinition: T) =>
  authDefinition;

export const createBlock = <
  Id extends string,
  A extends AuthDefinition<any>,
  O extends z.ZodObject<any>,
>(
  blockDefinition: BlockDefinition<Id, A, O>,
): BlockDefinition<Id, A, O> => blockDefinition;

export const createVersionedBlock = <
  Blocks extends Record<
    string,
    BlockDefinition<string, AuthDefinition<any>, z.ZodObject<any>>
  >,
>(
  blocks: Blocks,
): Blocks => blocks;

export const createAction = <
  A extends AuthDefinition<any>,
  BaseOptions extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
  O extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
>(
  actionDefinition: {
    auth?: A;
    baseOptions?: BaseOptions;
  } & ActionDefinition<A, BaseOptions, O>,
) => actionDefinition;

export const createActionHandler = <
  Auth extends AuthDefinition<any>,
  BaseOptions extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
  Options extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
>(
  action: ActionDefinition<Auth, BaseOptions, Options> & {
    auth?: Auth;
    baseOptions?: BaseOptions;
  },
  handler: Omit<
    ActionHandler<Auth, BaseOptions, Options>,
    "actionName" | "type"
  >,
) => ({
  ...handler,
  type: "action" as const,
  actionName: action.name,
});

export const createFetcherHandler = <
  Auth extends AuthDefinition<any>,
  BaseOptions extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
  Options extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
>(
  _action: ActionDefinition<Auth, BaseOptions, Options> & {
    auth?: Auth;
    baseOptions?: BaseOptions;
  },
  fetcherId: string,
  fetch: FetcherHandler<Auth, z.infer<BaseOptions> & z.infer<Options>>["fetch"],
) => ({
  type: "fetcher" as const,
  id: fetcherId,
  fetch,
});

export const parseBlockSchema = <
  I extends string,
  A extends AuthDefinition<any>,
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
  return z.object({
    id: z.string(),
    outgoingEdgeId: z.string().optional(),
    type: z.literal(blockDefinition.id),
    options: options.optional(),
  });
};

export const parseBlockCredentials = <
  I extends string,
  A extends AuthDefinition<any>,
>(
  blockId: I,
  authDefinition: A,
) => {
  return z.object({
    id: z.string(),
    type: z.literal(blockId),
    createdAt: z.date(),
    name: z.string(),
    iv: z.string(),
    data:
      authDefinition.type === "oauth"
        ? z.object({
            customClient: z.object({
              id: z.string(),
              secret: z.string(),
            }),
            credentials: z.object({
              accessToken: z.string(),
              refreshToken: z.string(),
              expiryDate: z.number(),
            }),
          })
        : authDefinition.schema,
  });
};

export const option = {
  object: <T extends z.ZodRawShape>(schema: T) => z.object(schema),
  literal: <T extends string>(value: T) => z.literal(value),
  string: z.string().optional(),
  boolean: z.boolean().optional(),
  enum: <T extends string>(values: readonly [T, ...T[]]) =>
    z.enum(values).optional(),
  number: singleVariableOrNumberSchema.optional(),
  staticNumber: z.number().optional(),
  array: <T extends z.ZodTypeAny>(schema: T) => z.array(schema).optional(),
  discriminatedUnion: <
    T extends string,
    J extends readonly [
      z.ZodObject<z.ZodRawShape>,
      ...z.ZodObject<z.ZodRawShape>[],
    ],
  >(
    field: T,
    schemas: J,
  ) =>
    z.discriminatedUnion(field, [
      z.object({ [field]: z.undefined() }),
      ...schemas,
    ] as const),
  saveResponseArray: <I extends readonly [string, ...string[]]>(
    items: I,
    layouts?: {
      item?: ZodLayoutMetadata<I[number]>;
      variableId?: ZodLayoutMetadata<string>;
    },
  ) =>
    z
      .array(
        z.object({
          item: z
            .enum(items)
            .optional()
            .meta({
              layout: {
                ...(layouts?.item ?? {}),
                placeholder: "Select a response",
              },
            }),
          variableId: z
            .string()
            .optional()
            .meta({
              layout: {
                ...(layouts?.variableId ?? {}),
                inputType: "variableDropdown",
              },
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
            input: z
              .string()
              .optional()
              .meta({ layout: { label: "Enter a field " } }),
            operator: z
              .enum(operators)
              .optional()
              .meta({ layout: { defaultValue: "Equal to" } }),
            value: z
              .string()
              .optional()
              .meta({ layout: { placeholder: "Enter a value" } }),
          }),
        ),
        joiner: z
          .enum(["AND", "OR"])
          .optional()
          .meta({
            layout: {
              placeholder: "Select joiner",
              isHidden: isJoinerHidden,
            },
          }),
      })
      .optional(),
};

export type { ZodLayoutMetadata } from "./zodLayout";

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
