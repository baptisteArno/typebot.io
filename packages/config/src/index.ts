import {
  Config,
  Effect,
  Layer,
  type Option,
  type Redacted,
  ServiceMap,
} from "effect";

const WorkflowsRpcClientConfigSchema = Config.all({
  rpcUrl: Config.url("WORKFLOWS_RPC_URL").pipe(Config.option),
  rpcSecret: Config.redacted("WORKFLOWS_RPC_SECRET"),
});

type WorkflowsRpcClientConfigService = {
  rpcUrl: Option.Option<URL>;
  rpcSecret: Redacted.Redacted<string>;
};

export class WorkflowsRpcClientConfig extends ServiceMap.Service<
  WorkflowsRpcClientConfig,
  WorkflowsRpcClientConfigService
>()("@typebot/WorkflowsRpcClientConfig") {
  static readonly layer = Layer.effect(
    WorkflowsRpcClientConfig,
    Effect.gen(function* () {
      return WorkflowsRpcClientConfig.of(yield* WorkflowsRpcClientConfigSchema);
    }),
  );
}

const WorkflowsServerConfigSchema = Config.all({
  port: Config.number("WORKFLOWS_SERVER_PORT").pipe(Config.withDefault(3000)),
  rpcSecret: Config.redacted("WORKFLOWS_RPC_SECRET"),
});

type WorkflowsServerConfigService = {
  port: number;
  rpcSecret: Redacted.Redacted<string>;
};

export class WorkflowsServerConfig extends ServiceMap.Service<
  WorkflowsServerConfig,
  WorkflowsServerConfigService
>()("@typebot/WorkflowsServerConfig") {
  static readonly layer = Layer.effect(
    WorkflowsServerConfig,
    Effect.gen(function* () {
      return WorkflowsServerConfig.of(yield* WorkflowsServerConfigSchema);
    }),
  );
}

const WorkflowsDatabaseConfigSchema = Config.all({
  databaseUrl: Config.redacted("WORKFLOWS_DATABASE_URL"),
});

type WorkflowsDatabaseConfigService = {
  databaseUrl: Redacted.Redacted<string>;
};

export class WorkflowsDatabaseConfig extends ServiceMap.Service<
  WorkflowsDatabaseConfig,
  WorkflowsDatabaseConfigService
>()("@typebot/WorkflowsDatabaseConfig") {
  static readonly layer = Layer.effect(
    WorkflowsDatabaseConfig,
    Effect.gen(function* () {
      return WorkflowsDatabaseConfig.of(yield* WorkflowsDatabaseConfigSchema);
    }),
  );
}

const NextAuthConfigSchema = Config.all({
  nextAuthUrl: Config.url("NEXTAUTH_URL"),
});

export class NextAuthConfig extends ServiceMap.Service<
  NextAuthConfig,
  {
    nextAuthUrl: URL;
  }
>()("@typebot/NextAuthConfig") {
  static readonly layer = Layer.effect(
    NextAuthConfig,
    Effect.gen(function* () {
      return NextAuthConfig.of(yield* NextAuthConfigSchema);
    }),
  );
}
