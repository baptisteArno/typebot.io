import {
  Cause,
  Config,
  Effect,
  Layer,
  Queue,
  Redacted,
  Schema,
  ServiceMap,
  Stream,
} from "effect";
import Redis from "ioredis";

export class RedisConnectError extends Schema.TaggedErrorClass<RedisConnectError>()(
  "@typebot/RedisConnectError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisPublishError extends Schema.TaggedErrorClass<RedisPublishError>()(
  "@typebot/RedisPublishError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisSubscribeError extends Schema.TaggedErrorClass<RedisSubscribeError>()(
  "@typebot/RedisSubscribeError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisGetError extends Schema.TaggedErrorClass<RedisGetError>()(
  "@typebot/RedisGetError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisSetError extends Schema.TaggedErrorClass<RedisSetError>()(
  "@typebot/RedisSetError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export class RedisClient extends ServiceMap.Service<
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
>()("@typebot/RedisClient") {
  static readonly layer = Layer.effect(
    RedisClient,
    Effect.gen(function* () {
      const redisUrl = yield* Config.schema(
        Schema.RedactedFromValue(Schema.URL),
        "REDIS_URL",
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
      const releaseClient = (redis: Redis) =>
        Effect.promise(() => redis.quit());

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
        Stream.callback<string, RedisSubscribeError>((queue) =>
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
                  Queue.offerUnsafe(queue, message);
                }
              });

              subscriber.on("error", (error) => {
                Queue.failCauseUnsafe(
                  queue,
                  Cause.fail(
                    new RedisSubscribeError({
                      message: formatUnknownError(error),
                      cause: error,
                    }),
                  ),
                );
              });

              subscriber.on("end", () => {
                Queue.endUnsafe(queue);
              });

              yield* Effect.tryPromise({
                try: () => subscriber.subscribe(channel),
                catch: (error) =>
                  new RedisSubscribeError({
                    message: formatUnknownError(error),
                    cause: error,
                  }),
              });

              return subscriber;
            }),
            releaseClient,
          ),
        );

      return RedisClient.of({
        get,
        set,
        publish,
        subscribe,
      });
    }),
  );
}

export const RedisClientLayer = RedisClient.layer;

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
