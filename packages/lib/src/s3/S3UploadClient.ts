import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import {
  Config,
  Context,
  Effect,
  Layer,
  Option,
  Redacted,
  Schema,
  Stream,
} from "effect";
import { Client } from "minio";

export class S3ClientUploadError extends Schema.TaggedError<S3ClientUploadError>()(
  "@typebot/S3ClientUploadError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

type UploadBody = Buffer | Readable | Stream.Stream<Uint8Array, unknown>;

export class S3UploadClient extends Context.Tag("@typebot/S3UploadClient")<
  S3UploadClient,
  {
    uploadObject: (params: {
      key: string;
      body: UploadBody;
    }) => Effect.Effect<void, S3ClientUploadError>;
  }
>() {}

export const S3UploadClientLayer = Layer.effect(
  S3UploadClient,
  Effect.gen(function* () {
    const accessKey = yield* Schema.Config("S3_ACCESS_KEY", Schema.String);
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
    const ssl = yield* Schema.Config("S3_SSL", Schema.BooleanFromString).pipe(
      Config.withDefault(true),
    );
    const bucket = yield* Schema.Config("S3_BUCKET", Schema.String);

    const client = new Client({
      endPoint: endpoint,
      port: port ?? undefined,
      useSSL: ssl,
      accessKey,
      secretKey: Redacted.value(secretKey),
      region,
    });

    const uploadObject = Effect.fn("S3UploadClient.uploadObject")(function* ({
      key,
      body,
    }: {
      key: string;
      body: UploadBody;
    }) {
      const readableBody = yield* toReadable(body);

      yield* Effect.tryPromise({
        try: () => client.putObject(bucket, key, readableBody),
        catch: (error) =>
          new S3ClientUploadError({
            message: formatUnknownError(error),
            cause: error,
          }),
      }).pipe(Effect.asVoid);
    });

    return S3UploadClient.of({
      uploadObject,
    });
  }),
);

const toReadable = (
  body: UploadBody,
): Effect.Effect<Buffer | Readable, never> => {
  if (Buffer.isBuffer(body) || body instanceof Readable) {
    return Effect.succeed(body);
  }

  return Effect.sync(() =>
    Readable.fromWeb(
      Stream.toReadableStream(
        body as Stream.Stream<Uint8Array, unknown, never>,
      ) as unknown as NodeReadableStream<any>,
    ),
  );
};

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
