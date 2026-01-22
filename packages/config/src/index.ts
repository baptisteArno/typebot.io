import { MultipartUpload } from "@effect-aws/s3";
import {
  Config,
  Context,
  Effect,
  Layer,
  Option,
  Redacted,
  Schema,
} from "effect";

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

export class S3ReadableConfig extends Context.Tag("@typebot/S3ReadableConfig")<
  S3ReadableConfig,
  {
    bucket: string;
  }
>() {}

export const S3ConfigLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const accessKey = yield* Schema.Config(
      "S3_ACCESS_KEY",
      Schema.Redacted(Schema.String),
    );
    const secretKey = yield* Schema.Config(
      "S3_SECRET_KEY",
      Schema.Redacted(Schema.String),
    );
    const endpoint = yield* Schema.Config("S3_ENDPOINT", Schema.String);
    const port = Option.getOrNull(
      yield* Schema.Config("S3_PORT", Schema.NumberFromString).pipe(
        Config.option,
      ),
    );
    const region = yield* Schema.Config("S3_REGION", Schema.String).pipe(
      Config.withDefault("us-east-1"),
    );
    const bucket = yield* Schema.Config("S3_BUCKET", Schema.String);
    const ssl = yield* Schema.Config("S3_SSL", Schema.BooleanFromString).pipe(
      Config.withDefault(true),
    );

    return Layer.mergeAll(
      Layer.succeed(S3ReadableConfig, { bucket }),
      MultipartUpload.layer({
        endpoint: `http${ssl ? "s" : ""}://${endpoint}${port ? `:${port}` : ""}`,
        region,
        credentials: {
          accessKeyId: Redacted.value(accessKey),
          secretAccessKey: Redacted.value(secretKey),
        },
        forcePathStyle: true,
      }),
    );
  }),
);
