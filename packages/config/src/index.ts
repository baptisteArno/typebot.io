import { Config, Context, Layer } from "effect";

const WorkflowsRpcClientConfigSchema = Config.all({
  rpcUrl: Config.url("WORKFLOWS_RPC_URL").pipe(Config.option),
  rpcSecret: Config.redacted(Config.string("WORKFLOWS_RPC_SECRET")),
});

export class WorkflowsRpcClientConfig extends Context.Tag(
  "@typebot/WorkflowsRpcClientConfig",
)<
  WorkflowsRpcClientConfig,
  Config.Config.Success<typeof WorkflowsRpcClientConfigSchema>
>() {
  static readonly layer = Layer.effect(
    WorkflowsRpcClientConfig,
    WorkflowsRpcClientConfigSchema,
  );
}

const WorkflowsServerConfigSchema = Config.all({
  port: Config.number("WORKFLOWS_SERVER_PORT").pipe(Config.withDefault(3000)),
  rpcSecret: Config.redacted(Config.string("WORKFLOWS_RPC_SECRET")),
});

export class WorkflowsServerConfig extends Context.Tag(
  "@typebot/WorkflowsServerConfig",
)<
  WorkflowsServerConfig,
  Config.Config.Success<typeof WorkflowsServerConfigSchema>
>() {
  static readonly layer = Layer.effect(
    WorkflowsServerConfig,
    WorkflowsServerConfigSchema,
  );
}

const WorkflowsDatabaseConfigSchema = Config.all({
  databaseUrl: Config.redacted(Config.string("WORKFLOWS_DATABASE_URL")),
});

export class WorkflowsDatabaseConfig extends Context.Tag(
  "@typebot/WorkflowsDatabaseConfig",
)<
  WorkflowsDatabaseConfig,
  Config.Config.Success<typeof WorkflowsDatabaseConfigSchema>
>() {
  static readonly layer = Layer.effect(
    WorkflowsDatabaseConfig,
    WorkflowsDatabaseConfigSchema,
  );
}

const NextAuthConfigSchema = Config.all({
  nextAuthUrl: Config.url("NEXTAUTH_URL"),
});

export class NextAuthConfig extends Context.Tag("@typebot/NextAuthConfig")<
  NextAuthConfig,
  Config.Config.Success<typeof NextAuthConfigSchema>
>() {
  static readonly layer = Layer.effect(NextAuthConfig, NextAuthConfigSchema);
}
