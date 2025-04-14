import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { WithoutVariables } from "@typebot.io/variables/types";
import type { z } from "@typebot.io/zod";
import type { SVGProps } from "react";

export type VariableStore = {
  get: (variableId: string) => string | (string | null)[] | null | undefined;
  set: (variables: { id: string; value: unknown }[]) => void;
  parse: (value: string) => string;
  list: () => {
    id: string;
    name: string;
    value?: string | (string | null)[] | null | undefined;
  }[];
};

export type AsyncVariableStore = Omit<VariableStore, "set"> & {
  set: (variables: { id: string; value: unknown }[]) => Promise<void>;
};

export type LogsStore = {
  add: (
    log:
      | string
      | {
          status?: "error" | "success" | "info";
          description: string;
          details?: string;
          context?: string;
        },
  ) => void;
};

export type FunctionToExecute = {
  args: Record<string, string | number | object | null>;
  content: string;
};

export type TurnableIntoParam<T = {}> = {
  blockId: string;
  /**
   * If defined will be used to convert the existing block options into the new block options.
   */
  transform?: (options: T) => any;
};

export type ActionDefinition<
  A extends AuthDefinition,
  BaseOptions extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
  Options extends z.ZodObject<z.ZodRawShape> = z.ZodObject<{}>,
> = {
  name: string;
  parseBlockNodeLabel?: (
    options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>,
  ) => string;
  fetchers?: FetcherDefinition<A, z.infer<BaseOptions> & z.infer<Options>>[];
  options?: Options;
  turnableInto?: TurnableIntoParam<z.infer<Options>>[];
  getSetVariableIds?: (options: z.infer<Options>) => string[];
  /**
   * Used for AI generation in the builder if enabled by the user.
   */
  aiGenerate?: {
    fetcherId: string;
    getModel: (params: {
      credentials: CredentialsFromAuthDef<A>;
      model: string;
    }) => any;
  };
  run?: {
    server?: (params: {
      credentials: CredentialsFromAuthDef<A>;
      options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
      variables: VariableStore;
      logs: LogsStore;
      sessionStore: SessionStore;
    }) => Promise<void> | void;
    /**
     * Used to stream a text bubble. Will only be used if the block following the integration block is a text bubble containing the variable returned by `getStreamVariableId`.
     */
    stream?: {
      getStreamVariableId: (
        options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>,
      ) => string | undefined;
      run: (params: {
        credentials: CredentialsFromAuthDef<A>;
        options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
        variables: AsyncVariableStore;
        sessionStore: SessionStore;
      }) => Promise<{
        stream?: ReadableStream<any>;
        error?: {
          description: string;
          details?: string;
          context?: string;
        };
      }>;
    };
    web?: {
      displayEmbedBubble?: {
        /**
         * Used to determine the URL to be displayed as a text bubble in runtimes where the code can't be executed. (i.e. WhatsApp)
         */
        parseUrl: (params: {
          credentials: CredentialsFromAuthDef<A>;
          options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
          variables: VariableStore;
          logs: LogsStore;
        }) => string | undefined;
        waitForEvent?: {
          getSaveVariableId?: (
            options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>,
          ) => string | undefined;
          parseFunction: (params: {
            credentials: CredentialsFromAuthDef<A>;
            options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
            variables: VariableStore;
            logs: LogsStore;
          }) => FunctionToExecute;
        };
        parseInitFunction: (params: {
          credentials: CredentialsFromAuthDef<A>;
          options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
          variables: VariableStore;
          logs: LogsStore;
        }) => FunctionToExecute;
      };
      parseFunction?: (params: {
        credentials: CredentialsFromAuthDef<A>;
        options: WithoutVariables<z.infer<BaseOptions> & z.infer<Options>>;
        variables: VariableStore;
        logs: LogsStore;
      }) => FunctionToExecute;
    };
  };
};

export type FetcherDefinition<A extends AuthDefinition, T = {}> = {
  id: string;
  /**
   * List of option keys to determine if the fetcher should be re-executed whenever these options are updated.
   */
  dependencies: (keyof T)[];
  fetch: (params: {
    credentials: CredentialsFromAuthDef<A> | undefined;
    options: T;
  }) => Promise<{
    data?: (string | { label: string; value: string })[];
    error?: {
      /**
       * Context of the error. i.e. "Fetching models", "Creating chat completion"
       */
      context?: string;
      /**
       * Description of the error. i.e. "No API key provided", "No model provided"
       */
      description: string;
      /**
       * Details of the error, is often a JSON stringified object.
       */
      details?: string;
    };
  }>;
};

export type AuthDefinition = {
  type: "encryptedCredentials";
  name: string;
  schema: z.ZodObject<any>;
};

export type CredentialsFromAuthDef<A extends AuthDefinition> = A extends {
  type: "encryptedCredentials";
  schema: infer S extends z.ZodObject<any>;
}
  ? z.infer<S>
  : never;

export type BlockDefinition<
  Id extends string,
  Auth extends AuthDefinition,
  Options extends z.ZodObject<any>,
> = {
  id: Id;
  name: string;
  fullName?: string;
  /**
   * Keywords used when searching for a block.
   */
  tags?: string[];
  LightLogo: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  DarkLogo?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  docsUrl?: string;
  onboarding?: {
    deployedAt: Date;
    youtubeId: string;
  };
  auth?: Auth;
  options?: Options | undefined;
  fetchers?: FetcherDefinition<Auth, Options>[];
  actions: ActionDefinition<Auth, Options>[];
};

export type FetchItemsParams<T> = T extends ActionDefinition<
  infer A,
  infer BaseOptions,
  infer Options
>
  ? {
      credentials: CredentialsFromAuthDef<A>;
      options: BaseOptions & Options;
    }
  : never;
