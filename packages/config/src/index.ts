import { MultipartUpload } from "@effect-aws/s3";
import {
  Config,
  ConfigProvider,
  Context,
  Effect,
  Layer,
  Redacted,
  Schema,
} from "effect";

const WorkflowsAppConfigSchema = Config.all({
  workflowsServer: Config.all({
    rpcUrl: Config.url("WORKFLOWS_RPC_URL"),
    port: Config.number("WORKFLOWS_SERVER_PORT").pipe(Config.withDefault(3000)),
    rpcSecret: Config.redacted(Config.string("WORKFLOWS_RPC_SECRET")),
  }),
  nextAuthUrl: Config.url("NEXTAUTH_URL"),
  appDatabaseUrl: Config.redacted(Config.string("DATABASE_URL")),
  databaseUrl: Config.redacted(Config.string("WORKFLOWS_DATABASE_URL")),
});

export class WorkflowsAppConfig extends Context.Tag(
  "@typebot/WorkflowsAppConfig",
)<
  WorkflowsAppConfig,
  Config.Config.Success<typeof WorkflowsAppConfigSchema>
>() {
  static readonly layer = Layer.effect(
    WorkflowsAppConfig,
    WorkflowsAppConfigSchema.pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
    ),
  );
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
    const port = yield* Schema.Config("S3_PORT", Schema.NumberFromString);
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
        endpoint: `http${ssl ? "s" : ""}://${endpoint}:${port}`,
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
