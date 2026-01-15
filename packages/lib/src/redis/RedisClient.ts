import { Context, Effect, Layer, Redacted, Schema, Stream } from "effect";
import Redis from "ioredis";

export class RedisPublishError extends Schema.TaggedError<RedisPublishError>()(
  "@typebot/RedisPublishError",
  {
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class RedisSubscribeError extends Schema.TaggedError<RedisSubscribeError>()(
  "@typebot/RedisSubscribeError",
  {
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class RedisGetError extends Schema.TaggedError<RedisGetError>()(
  "@typebot/RedisGetError",
  {
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class RedisSetError extends Schema.TaggedError<RedisSetError>()(
  "@typebot/RedisSetError",
  {
    cause: Schema.optional(Schema.Unknown),
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
      () => new Redis(Redacted.value(redisUrl).toString()),
    );
    const releaseClient = (redis: Redis) => Effect.promise(() => redis.quit());

    const client = yield* Effect.acquireRelease(createClient, releaseClient);

    const get = Effect.fn("RedisClient.get")((key: string) =>
      Effect.tryPromise({
        try: () => client.get(key),
        catch: (error) => new RedisGetError({ cause: error }),
      }),
    );

    const set = Effect.fn("RedisClient.set")((key: string, value: string) =>
      Effect.tryPromise({
        try: () => client.set(key, value),
        catch: (error) => new RedisSetError({ cause: error }),
      }).pipe(Effect.asVoid),
    );

    const publish = Effect.fn("RedisClient.publish")(
      (
        channel: string,
        message: string,
      ): Effect.Effect<void, RedisPublishError> =>
        Effect.tryPromise({
          try: () => client.publish(channel, message),
          catch: (error) => new RedisPublishError({ cause: error }),
        }).pipe(Effect.asVoid),
    );

    const subscribe = (
      channel: string,
    ): Stream.Stream<string, RedisSubscribeError> =>
      Stream.asyncPush<string, RedisSubscribeError>((emit) =>
        Effect.acquireRelease(
          Effect.gen(function* () {
            const subscriber = yield* createClient;

            subscriber.on("message", (ch, message) => {
              if (ch === channel) {
                emit.single(message);
              }
            });

            subscriber.on("error", (error) => {
              emit.fail(
                new RedisSubscribeError({
                  cause: error,
                }),
              );
            });

            yield* Effect.tryPromise({
              try: () => subscriber.subscribe(channel),
              catch: (error) =>
                new RedisSubscribeError({
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
