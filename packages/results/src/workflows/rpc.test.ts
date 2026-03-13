import { describe, expect, it } from "bun:test";
import {
  RedisClient,
  RedisGetError,
  RedisPublishError,
  RedisSetError,
} from "@typebot.io/lib/redis/RedisClient";
import { Effect, Exit, Fiber, Layer, Queue, Stream } from "effect";
import { WorkflowEngine } from "effect/unstable/workflow";
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
      subscribe: () => Stream.fromQueue(progressQueue),
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

    const program = Effect.gen(function* () {
      const streamFiber = yield* executeExportResultsWorkflowHandler(
        testPayload,
      ).pipe(Stream.runCollect, Effect.forkChild);

      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "0");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "25");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "50");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "75");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "100");

      return yield* Fiber.join(streamFiber);
    }).pipe(
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(mockRedisClientLayer, WorkflowEngine.layerMemory),
          ),
        ),
      ),
    );

    const result = await Effect.runPromise(program);

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
      subscribe: () => Stream.fromQueue(progressQueue),
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

    const program = Effect.gen(function* () {
      const streamFiber = yield* executeExportResultsWorkflowHandler(
        testPayload,
      ).pipe(Stream.runCollect, Effect.forkChild);

      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "0");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "25");
      yield* Effect.sleep("5 millis");
      yield* Queue.offer(progressQueue, "50");

      return yield* Fiber.join(streamFiber).pipe(Effect.exit);
    }).pipe(
      Effect.timeout("1 second"),
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(mockRedisClientLayer, WorkflowEngine.layerMemory),
          ),
        ),
      ),
    );

    const result = await Effect.runPromise(program);

    expect(Exit.isFailure(result)).toBe(true);
  }, 2_000);
});
