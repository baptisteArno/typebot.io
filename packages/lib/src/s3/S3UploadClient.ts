import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import {
  Config,
  Effect,
  Layer,
  Option,
  Redacted,
  Schema,
  ServiceMap,
  Stream,
} from "effect";
import { Client } from "minio";

export class S3ClientUploadError extends Schema.TaggedErrorClass<S3ClientUploadError>()(
  "@typebot/S3ClientUploadError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

type UploadBody = Buffer | Readable | Stream.Stream<Uint8Array, unknown>;

export class S3UploadClient extends ServiceMap.Service<
  S3UploadClient,
  {
    uploadObject: (params: {
      key: string;
      body: UploadBody;
    }) => Effect.Effect<void, S3ClientUploadError>;
  }
>()("@typebot/S3UploadClient") {
  static readonly layer = Layer.effect(
    S3UploadClient,
    Effect.gen(function* () {
      const accessKey = yield* Config.string("S3_ACCESS_KEY");
      const secretKey = yield* Config.redacted("S3_SECRET_KEY");
      const endpoint = yield* Config.string("S3_ENDPOINT");
      const portOption = yield* Config.option(Config.number("S3_PORT"));
      const region = yield* Config.string("S3_REGION").pipe(
        Config.withDefault("us-east-1"),
      );
      const ssl = yield* Config.boolean("S3_SSL").pipe(
        Config.withDefault(true),
      );
      const bucket = yield* Config.string("S3_BUCKET");
      const port = Option.isSome(portOption) ? portOption.value : undefined;

      const client = new Client({
        endPoint: endpoint,
        port,
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
}

export const S3UploadClientLayer = S3UploadClient.layer;

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
