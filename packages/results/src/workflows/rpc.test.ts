import { describe, expect, it } from "bun:test";
import { RedisClient } from "@typebot.io/lib/redis/RedisClient";
import { Effect, Layer, Stream } from "effect";
import { WorkflowEngine } from "effect/unstable/workflow";
import {
  ExportResultsWorkflow,
  TypebotNotFoundError,
} from "./exportResultsWorkflow";
import {
  getExportResultsWorkflowStatusHandler,
  startExportResultsWorkflowHandler,
} from "./rpc";

const testPayload = {
  id: "test-typebot-id:test-workflow-id",
  typebotId: "test-typebot-id",
};

const createRedisLayer = (getProgress: () => string | null) =>
  Layer.succeed(RedisClient, {
    get: () => Effect.sync(getProgress),
    set: () => Effect.void,
    publish: () => Effect.void,
    subscribe: () => Stream.empty,
  });

describe("export results workflow RPC", () => {
  it("starts without waiting for export, then reports progress and completion", async () => {
    let progress: string | null = null;
    const mockWorkflowLayer = ExportResultsWorkflow.toLayer(
      Effect.fn(function* () {
        yield* Effect.sleep("100 millis");
        return {
          fileUrl: new URL("http://example.com/file.csv"),
          typebotName: "Test Typebot",
        };
      }),
    );

    const program = Effect.gen(function* () {
      const start = yield* startExportResultsWorkflowHandler(testPayload);
      const starting = yield* getExportResultsWorkflowStatusHandler({
        workflowId: start.workflowId,
        typebotId: testPayload.typebotId,
      });
      progress = "25";
      const inProgress = yield* getExportResultsWorkflowStatusHandler({
        workflowId: start.workflowId,
        typebotId: testPayload.typebotId,
      });
      yield* Effect.sleep("150 millis");
      const completed = yield* getExportResultsWorkflowStatusHandler({
        workflowId: start.workflowId,
        typebotId: testPayload.typebotId,
      });
      return { start, starting, inProgress, completed };
    }).pipe(
      Effect.timeout("2 seconds"),
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(
              createRedisLayer(() => progress),
              WorkflowEngine.layerMemory,
            ),
          ),
        ),
      ),
    );

    const result = await Effect.runPromise(program);
    expect(result.start).toEqual({ workflowId: testPayload.id });
    expect(result.starting).toEqual({
      status: "starting",
      workflowId: testPayload.id,
    });
    expect(result.inProgress).toEqual({ status: "in_progress", progress: 25 });
    expect(result.completed).toEqual({
      status: "completed",
      fileUrl: "http://example.com/file.csv",
    });
  });

  it("reports workflow failure through status instead of a broken stream", async () => {
    const mockWorkflowLayer = ExportResultsWorkflow.toLayer(
      Effect.fn(function* () {
        yield* Effect.sleep("40 millis");
        return yield* new TypebotNotFoundError();
      }),
    );

    const program = Effect.gen(function* () {
      yield* startExportResultsWorkflowHandler(testPayload);
      yield* Effect.sleep("80 millis");
      return yield* getExportResultsWorkflowStatusHandler({
        workflowId: testPayload.id,
        typebotId: testPayload.typebotId,
      });
    }).pipe(
      Effect.timeout("2 seconds"),
      Effect.provide(
        mockWorkflowLayer.pipe(
          Layer.provideMerge(
            Layer.mergeAll(
              createRedisLayer(() => null),
              WorkflowEngine.layerMemory,
            ),
          ),
        ),
      ),
    );

    const result = await Effect.runPromise(program);
    expect(result.status).toBe("error");
  });
});
