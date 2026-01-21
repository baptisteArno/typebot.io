import { Context, Effect, Layer, Redacted, Schema, Stream } from "effect";
import Redis from "ioredis";

export class RedisConnectError extends Schema.TaggedError<RedisConnectError>()(
  "@typebot/RedisConnectError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisPublishError extends Schema.TaggedError<RedisPublishError>()(
  "@typebot/RedisPublishError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisSubscribeError extends Schema.TaggedError<RedisSubscribeError>()(
  "@typebot/RedisSubscribeError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisGetError extends Schema.TaggedError<RedisGetError>()(
  "@typebot/RedisGetError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisSetError extends Schema.TaggedError<RedisSetError>()(
  "@typebot/RedisSetError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisClient extends Context.Tag("@typebot/RedisClient")<
  RedisClient,
  {
    get: (key: string) => Effect.Effect<string | null, RedisGetError>;
    set: (key: string, value: string) => Effect.Effect<void, RedisSetError>;
    publish: (
      channel: string,
      message: string,
    ) => Effect.Effect<void, RedisPublishError, never>;
    subscribe: (channel: string) => Stream.Stream<string, RedisSubscribeError>;
  }
>() {}

export const RedisClientLayer = Layer.unwrapScoped(
  Effect.gen(function* () {
    const redisUrl = yield* Schema.Config(
      "REDIS_URL",
      Schema.Redacted(Schema.URL),
    );
    const createClient = Effect.sync(
      () =>
        new Redis(Redacted.value(redisUrl).toString(), {
          lazyConnect: true,
        }),
    );
    const connectClient = (redis: Redis) =>
      Effect.tryPromise({
        try: () => {
          redis.on("error", noop);
          return redis.connect();
        },
        catch: (error) =>
          new RedisConnectError({
            message: formatUnknownError(error),
            cause: error,
          }),
      }).pipe(Effect.as(redis));
    const releaseClient = (redis: Redis) => Effect.promise(() => redis.quit());

    const client = yield* Effect.acquireRelease(
      createClient.pipe(Effect.flatMap(connectClient)),
      releaseClient,
    );

    const get = Effect.fn("RedisClient.get")((key: string) =>
      Effect.tryPromise({
        try: () => client.get(key),
        catch: (error) =>
          new RedisGetError({
            message: formatUnknownError(error),
            cause: error,
          }),
      }),
    );

    const set = Effect.fn("RedisClient.set")((key: string, value: string) =>
      Effect.tryPromise({
        try: () => client.set(key, value),
        catch: (error) =>
          new RedisSetError({
            message: formatUnknownError(error),
            cause: error,
          }),
      }).pipe(Effect.asVoid),
    );

    const publish = Effect.fn("RedisClient.publish")(
      (
        channel: string,
        message: string,
      ): Effect.Effect<void, RedisPublishError> =>
        Effect.tryPromise({
          try: () => client.publish(channel, message),
          catch: (error) =>
            new RedisPublishError({
              message: formatUnknownError(error),
              cause: error,
            }),
        }).pipe(Effect.asVoid),
    );

    const subscribe = (
      channel: string,
    ): Stream.Stream<string, RedisSubscribeError> =>
      Stream.asyncPush<string, RedisSubscribeError>((emit) =>
        Effect.acquireRelease(
          Effect.gen(function* () {
            const subscriber = yield* createClient.pipe(
              Effect.flatMap((redis) =>
                connectClient(redis).pipe(
                  Effect.mapError(
                    (error) =>
                      new RedisSubscribeError({
                        message: error.message,
                        cause: error.cause,
                      }),
                  ),
                ),
              ),
            );

            subscriber.on("message", (ch, message) => {
              if (ch === channel) {
                emit.single(message);
              }
            });

            subscriber.on("error", (error) => {
              emit.fail(
                new RedisSubscribeError({
                  message: formatUnknownError(error),
                  cause: error,
                }),
              );
            });

            yield* Effect.tryPromise({
              try: () => subscriber.subscribe(channel),
              catch: (error) =>
                new RedisSubscribeError({
                  message: formatUnknownError(error),
                  cause: error,
                }),
            });

            // Return cleanup function (handled by acquireRelease in createSubscriber)
            return subscriber;
          }),
          releaseClient,
        ),
      );

    return Layer.succeed(RedisClient, {
      get,
      set,
      publish,
      subscribe,
    });
  }),
);

const noop = (_: unknown) => {};

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
