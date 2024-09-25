import type {
  AnyMutationProcedure,
  AnyQueryProcedure,
  AnyRootConfig,
  AnySubscriptionProcedure,
  DefaultErrorShape,
  Procedure,
  ProcedureParams,
  ProcedureRouterRecord,
  ProcedureType,
  Router,
  TRPCError,
} from "@trpc/server";
import type { TRPCErrorShape, TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import type { AnyZodObject, ZodIssue } from "zod";

interface DeprecatedProcedureRouterRecord {
  queries: Record<string, AnyQueryProcedure>;
  mutations: Record<string, AnyMutationProcedure>;
  subscriptions: Record<string, AnySubscriptionProcedure>;
}

interface RouterDef<
  TConfig extends AnyRootConfig,
  TRecord extends ProcedureRouterRecord,
  /**
   * @deprecated
   */
  TOld extends DeprecatedProcedureRouterRecord = {
    queries: {};
    mutations: {};
    subscriptions: {};
  },
> {
  _config: TConfig;
  router: true;
  procedures: TRecord;
  record: TRecord;
  /**
   * V9 queries
   * @deprecated
   */
  queries: TOld["queries"];
  /**
   * V9 mutations
   * @deprecated
   */
  mutations: TOld["mutations"];
  /**
   * V9 subscriptions
   * @deprecated
   */
  subscriptions: TOld["subscriptions"];
}

interface RootConfigTypes {
  ctx: object;
  meta: object;
  errorShape: unknown;
  transformer: unknown;
}

/**
 * The default check to see if we're in a server
 */
export declare const isServerDefault: boolean;
/**
 * The runtime config that are used and actually represents real values underneath
 * @internal
 */

type ErrorFormatter<TContext, TShape extends TRPCErrorShape<number>> = ({
  error,
}: {
  error: TRPCError;
  type: ProcedureType | "unknown";
  path: string | undefined;
  input: unknown;
  ctx: TContext | undefined;
  shape: DefaultErrorShape;
}) => TShape;

interface RuntimeConfig<TTypes extends RootConfigTypes> {
  /**
   * Use a data transformer
   * @link https://trpc.io/docs/data-transformers
   */
  transformer: TTypes["transformer"];
  /**
   * Use custom error formatting
   * @link https://trpc.io/docs/error-formatting
   */
  errorFormatter: ErrorFormatter<
    TTypes["ctx"],
    TRPCErrorShape<number> & {
      [key: string]: any;
    }
  >;
  /**
   * Allow `@trpc/server` to run in non-server environments
   * @warning **Use with caution**, this should likely mainly be used within testing.
   * @default false
   */
  allowOutsideOfServer: boolean;
  /**
   * Is this a server environment?
   * @warning **Use with caution**, this should likely mainly be used within testing.
   * @default typeof window === 'undefined' || 'Deno' in window || process.env.NODE_ENV === 'test'
   */
  isServer: boolean;
  /**
   * Is this development?
   * Will be used to decide if the API should return stack traces
   * @default process.env.NODE_ENV !== 'production'
   */
  isDev: boolean;
  defaultMeta?: TTypes["meta"] extends object ? TTypes["meta"] : never;
}
/**
 * @internal
 */
type CreateRootConfigTypes<TGenerics extends RootConfigTypes> = TGenerics;
/**
 * The config that is resolved after `initTRPC.create()` has been called
 * Combination of `InitTOptions` + `InitGenerics`
 * @internal
 */
interface RootConfig<TGenerics extends RootConfigTypes>
  extends RuntimeConfig<TGenerics> {
  $types: TGenerics;
}

export type OpenApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type TRPCMeta = Record<string, unknown>;

export type OpenApiContentType =
  | "application/json"
  | "application/x-www-form-urlencoded"
  | (string & {});

export type OpenApiMeta<TMeta = TRPCMeta> = TMeta & {
  openapi?: {
    enabled?: boolean;
    method: OpenApiMethod;
    path: `/${string}`;
    summary?: string;
    description?: string;
    protect?: boolean;
    tags?: string[];
    contentTypes?: OpenApiContentType[];
    deprecated?: boolean;
    requestHeaders?: AnyZodObject;
    responseHeaders?: AnyZodObject;
    successDescription?: string;
    errorResponses?: number[] | { [key: number]: string };
  };
};

export type OpenApiProcedure<TMeta = TRPCMeta> = Procedure<
  "query" | "mutation",
  ProcedureParams<
    RootConfig<{
      transformer: any;
      errorShape: any;
      ctx: any;
      meta: OpenApiMeta<TMeta>;
    }>,
    any,
    any,
    any,
    any,
    any,
    OpenApiMeta<TMeta>
  >
>;

export type OpenApiProcedureRecord<TMeta = TRPCMeta> = Record<
  string,
  OpenApiProcedure<TMeta>
>;

export type OpenApiRouter<TMeta = TRPCMeta> = Router<
  RouterDef<
    RootConfig<{
      transformer: any;
      errorShape: any;
      ctx: any;
      meta: OpenApiMeta<TMeta>;
    }>,
    any,
    any
  >
>;

export type OpenApiSuccessResponse<D = any> = D;

export type OpenApiErrorResponse = {
  message: string;
  code: TRPC_ERROR_CODE_KEY;
  issues?: ZodIssue[];
};

export type OpenApiResponse<D = any> =
  | OpenApiSuccessResponse<D>
  | OpenApiErrorResponse;

type ParserZodEsque<TInput, TParsedInput> = {
  _input: TInput;
  _output: TParsedInput;
};
type ParserValibotEsque<TInput, TParsedInput> = {
  types?: {
    input: TInput;
    output: TParsedInput;
  };
};
type ParserMyZodEsque<TInput> = {
  parse: (input: any) => TInput;
};
type ParserSuperstructEsque<TInput> = {
  create: (input: unknown) => TInput;
};
type ParserCustomValidatorEsque<TInput> = (
  input: unknown,
) => Promise<TInput> | TInput;
type ParserYupEsque<TInput> = {
  validateSync: (input: unknown) => TInput;
};
type ParserScaleEsque<TInput> = {
  assert(value: unknown): asserts value is TInput;
};
type ParserWithoutInput<TInput> =
  | ParserCustomValidatorEsque<TInput>
  | ParserMyZodEsque<TInput>
  | ParserScaleEsque<TInput>
  | ParserSuperstructEsque<TInput>
  | ParserYupEsque<TInput>;
type ParserWithInputOutput<TInput, TParsedInput> =
  | ParserZodEsque<TInput, TParsedInput>
  | ParserValibotEsque<TInput, TParsedInput>;
export type Parser = ParserWithInputOutput<any, any> | ParserWithoutInput<any>;
