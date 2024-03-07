import { SVGProps } from 'react'
import { z } from './zod'
import { ZodRawShape } from 'zod'
import { enabledBlocks } from '@typebot.io/forge-repository'

export type VariableStore = {
  get: (variableId: string) => string | (string | null)[] | null | undefined
  set: (variableId: string, value: unknown) => void
  parse: (value: string) => string
  list: () => {
    id: string
    name: string
    value?: string | (string | null)[] | null | undefined
  }[]
}

export type LogsStore = {
  add: (
    log:
      | string
      | {
          status: 'error' | 'success' | 'info'
          description: string
          details?: unknown
        }
  ) => void
}

export type FunctionToExecute = {
  args: Record<string, string | number | null>
  content: string
}

export type ReadOnlyVariableStore = Omit<VariableStore, 'set'>

export type TurnableIntoParam<T = {}> = {
  blockType: (typeof enabledBlocks)[number]
  /**
   * If defined will be used to convert the existing block options into the new block options.
   */
  customMapping?: (options: T) => any
}

export type ActionDefinition<
  A extends AuthDefinition,
  BaseOptions extends z.ZodObject<ZodRawShape> = z.ZodObject<{}>,
  Options extends z.ZodObject<ZodRawShape> = z.ZodObject<{}>
> = {
  name: string
  fetchers?: FetcherDefinition<A, z.infer<BaseOptions> & z.infer<Options>>[]
  options?: Options
  turnableInto?: TurnableIntoParam<z.infer<Options>>[]
  getSetVariableIds?: (options: z.infer<Options>) => string[]
  run?: {
    server?: (params: {
      credentials: CredentialsFromAuthDef<A>
      options: z.infer<BaseOptions> & z.infer<Options>
      variables: VariableStore
      logs: LogsStore
    }) => Promise<void> | void
    /**
     * Used to stream a text bubble. Will only be used if the block following the integration block is a text bubble containing the variable returned by `getStreamVariableId`.
     */
    stream?: {
      getStreamVariableId: (options: z.infer<Options>) => string | undefined
      run: (params: {
        credentials: CredentialsFromAuthDef<A>
        options: z.infer<BaseOptions> & z.infer<Options>
        variables: ReadOnlyVariableStore
      }) => Promise<ReadableStream<any> | undefined>
    }
    web?: {
      displayEmbedBubble?: {
        waitForEvent?: {
          getSaveVariableId?: (
            options: z.infer<BaseOptions> & z.infer<Options>
          ) => string | undefined
          parseFunction: (params: {
            options: z.infer<BaseOptions> & z.infer<Options>
          }) => FunctionToExecute
        }
        parseInitFunction: (params: {
          options: z.infer<BaseOptions> & z.infer<Options>
        }) => FunctionToExecute
      }
      parseFunction?: (params: {
        options: z.infer<BaseOptions> & z.infer<Options>
      }) => FunctionToExecute
    }
  }
}

export type FetcherDefinition<A extends AuthDefinition, T = {}> = {
  id: string
  /**
   * List of option keys to determine if the fetcher should be re-executed whenever these options are updated.
   */
  dependencies: (keyof T)[]
  fetch: (params: {
    credentials: CredentialsFromAuthDef<A>
    options: T
  }) => Promise<(string | { label: string; value: string })[]>
}

export type AuthDefinition = {
  type: 'encryptedCredentials'
  name: string
  schema: z.ZodObject<any>
}

export type CredentialsFromAuthDef<A extends AuthDefinition> = A extends {
  type: 'encryptedCredentials'
  schema: infer S extends z.ZodObject<any>
}
  ? z.infer<S>
  : never

export type BlockDefinition<
  Id extends string,
  Auth extends AuthDefinition,
  Options extends z.ZodObject<any>
> = {
  id: Id
  name: string
  fullName?: string
  /**
   * Keywords used when searching for a block.
   */
  tags?: string[]
  LightLogo: (props: SVGProps<SVGSVGElement>) => JSX.Element
  DarkLogo?: (props: SVGProps<SVGSVGElement>) => JSX.Element
  docsUrl?: string
  auth?: Auth
  options?: Options | undefined
  fetchers?: FetcherDefinition<Auth, Options>[]
  actions: ActionDefinition<Auth, Options>[]
}

export type FetchItemsParams<T> = T extends ActionDefinition<
  infer A,
  infer BaseOptions,
  infer Options
>
  ? {
      credentials: CredentialsFromAuthDef<A>
      options: BaseOptions & Options
    }
  : never
