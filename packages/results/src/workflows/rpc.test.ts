import { describe, expect, it } from "bun:test";
import { WorkflowEngine } from "@effect/workflow";
import {
  RedisClient,
  RedisGetError,
  RedisPublishError,
  RedisSetError,
} from "@typebot.io/lib/redis/RedisClient";
import { Chunk, Effect, Exit, Fiber, Layer, Queue, Stream } from "effect";
import {
  ExportResultsWorkflow,
  TypebotNotFoundError,
} from "./exportResultsWorkflow";
import { executeExportResultsWorkflowHandler } from "./rpc";

describe("ExecuteExportResultsWorkflow", () => {
  it("should emit starting, in_progress, and completed messages in sequence", async () => {
    const progressQueue = await Effect.runPromise(Queue.unbounded<string>());

    const mockRedisClientLayer = Layer.succeed(RedisClient, {
      get: () =>
        Effect.fail(
          new RedisGetError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
      set: () =>
        Effect.fail(
          new RedisSetError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
      subscribe: () => Stream.fromQueue(progressQueue, { shutdown: true }),
      publish: () =>
        Effect.fail(
          new RedisPublishError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
    });

    const mockWorkflowLayer = ExportResultsWorkflow.toLayer(
      Effect.fn(function* () {
        yield* Effect.sleep("50 millis");
        return {
          fileUrl: new URL("http://example.com/file.csv"),
          typebotName: "Test Typebot",
        };
      }),
    );

    const testPayload = {
      id: "test-workflow-id",
      typebotId: "test-typebot-id",
    };

    const result = await Effect.gen(function* () {
      const streamFiber = yield* executeExportResultsWorkflowHandler(
        testPayload,
      ).pipe(Stream.runCollect, Effect.fork);

      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("0");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("25");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("50");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("75");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("100");
      yield* progressQueue.shutdown;

      const collected = yield* Fiber.join(streamFiber);
      return Chunk.toReadonlyArray(collected);
    }).pipe(
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.merge(mockRedisClientLayer, WorkflowEngine.layerMemory),
          ),
        ),
      ),
      Effect.runPromise,
    );

    expect(result.length).toBe(6);
    expect(result[0]).toEqual({
      status: "starting",
      workflowId: "test-workflow-id",
    });
    expect(result[1]).toEqual({ status: "in_progress", progress: 0 });
    expect(result[2]).toEqual({ status: "in_progress", progress: 25 });
    expect(result[3]).toEqual({ status: "in_progress", progress: 50 });
    expect(result[4]).toEqual({ status: "in_progress", progress: 75 });
    expect(result[5]).toEqual({
      status: "completed",
      fileUrl: "http://example.com/file.csv",
    });
  });

  it("should fail when workflow fails (and not hang)", async () => {
    const progressQueue = await Effect.runPromise(Queue.unbounded<string>());

    const mockRedisClientLayer = Layer.succeed(RedisClient, {
      get: () =>
        Effect.fail(
          new RedisGetError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
      set: () =>
        Effect.fail(
          new RedisSetError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
      subscribe: () => Stream.fromQueue(progressQueue, { shutdown: true }),
      publish: () =>
        Effect.fail(
          new RedisPublishError({
            message: "Not implemented",
            cause: "Not implemented",
          }),
        ),
    });

    const mockWorkflowLayer = ExportResultsWorkflow.toLayer(
      Effect.fn(function* () {
        yield* Effect.sleep("40 millis");
        return yield* new TypebotNotFoundError();
      }),
    );

    const testPayload = {
      id: "test-workflow-id",
      typebotId: "test-typebot-id",
    };

    const result = await Effect.gen(function* () {
      const streamFiber = yield* executeExportResultsWorkflowHandler(
        testPayload,
      ).pipe(Stream.runCollect, Effect.fork);

      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("0");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("25");
      yield* Effect.sleep("5 millis");
      yield* progressQueue.offer("50");

      return yield* Fiber.join(streamFiber).pipe(Effect.exit);
    }).pipe(
      Effect.timeoutFail({
        duration: "1 second",
        onTimeout: () => new Error("Timed out"),
      }),
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.merge(mockRedisClientLayer, WorkflowEngine.layerMemory),
          ),
        ),
      ),
      Effect.runPromise,
    );

    expect(Exit.isFailure(result)).toBe(true);
  }, 2_000);
});
