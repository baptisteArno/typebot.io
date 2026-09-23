import { WorkflowsRpcClientProtocolLayer } from "@typebot.io/config/workflowsRpcProtocol";
import { RedisClient, RedisGetError } from "@typebot.io/lib/redis/RedisClient";
import { Cause, Effect, Exit, Layer, Option, Schema, ServiceMap } from "effect";
import {
  Rpc,
  RpcClient,
  type RpcClientError,
  RpcGroup,
} from "effect/unstable/rpc";
import type { TimeFilter } from "../timeFilter";
import {
  EXPORT_PROGRESS_CHANNEL_PREFIX,
  ExportResultsWorkflow,
  SendExportToEmailWorkflow,
} from "./exportResultsWorkflow";

const ExportResultsWorkflowStatusChunk = Schema.Union([
  Schema.Struct({
    status: Schema.Literal("starting"),
    workflowId: Schema.String,
  }),
  Schema.Struct({
    status: Schema.Literal("in_progress"),
    progress: Schema.Number,
  }),
  Schema.Struct({
    status: Schema.Literal("completed"),
    fileUrl: Schema.String,
  }),
  Schema.Struct({
    status: Schema.Literal("error"),
    message: Schema.String,
  }),
]);

export type ExportResultsWorkflowStatusChunk = Schema.Schema.Type<
  typeof ExportResultsWorkflowStatusChunk
>;

export class ResultsWorkflowsRpc extends RpcGroup.make(
  Rpc.make("StartExportResultsWorkflow", {
    success: Schema.Struct({ workflowId: Schema.String }),
    error: ExportResultsWorkflow.errorSchema,
    payload: ExportResultsWorkflow.payloadSchema,
  }),
  Rpc.make("GetExportResultsWorkflowStatus", {
    success: ExportResultsWorkflowStatusChunk,
    error: RedisGetError,
    payload: Schema.Struct({
      workflowId: Schema.String,
      typebotId: Schema.String,
    }),
  }),
  Rpc.make("SendExportToEmail", {
    error: SendExportToEmailWorkflow.errorSchema,
    payload: SendExportToEmailWorkflow.payloadSchema,
  }),
) {}

export const startExportResultsWorkflowHandler = (payload: {
  readonly id: string;
  readonly typebotId: string;
  readonly includeDeletedBlocks?: boolean;
  readonly timeFilter?: TimeFilter;
  readonly timeZone?: string;
}) =>
  ExportResultsWorkflow.execute(payload, { discard: true }).pipe(
    Effect.as({ workflowId: payload.id }),
  );

export const getExportResultsWorkflowStatusHandler = ({
  workflowId,
  typebotId,
}: {
  readonly workflowId: string;
  readonly typebotId: string;
}) =>
  Effect.gen(function* () {
    const executionId = yield* ExportResultsWorkflow.executionId({
      id: workflowId,
      typebotId,
    });
    const result = yield* ExportResultsWorkflow.poll(executionId);

    if (Option.isSome(result) && result.value._tag === "Complete") {
      const exit = result.value.exit;
      if (Exit.isSuccess(exit)) {
        return {
          status: "completed" as const,
          fileUrl: exit.value.fileUrl.toString(),
        };
      }
      return {
        status: "error" as const,
        message:
          Cause.prettyErrors(exit.cause)
            .map((error) => error.message)
            .join("\n") || Cause.pretty(exit.cause),
      };
    }

    const redis = yield* RedisClient;
    const storedProgress = yield* redis.get(
      `${EXPORT_PROGRESS_CHANNEL_PREFIX}${workflowId}`,
    );
    if (storedProgress !== null) {
      const progress = Number.parseFloat(storedProgress);
      if (Number.isFinite(progress))
        return { status: "in_progress" as const, progress };
    }
    return { status: "starting" as const, workflowId };
  });

export const ResultsWorkflowsRpcLayer = ResultsWorkflowsRpc.toLayer(
  Effect.succeed({
    StartExportResultsWorkflow: startExportResultsWorkflowHandler,
    GetExportResultsWorkflowStatus: getExportResultsWorkflowStatusHandler,
    SendExportToEmail: (payload) =>
      SendExportToEmailWorkflow.execute(payload, {
        discard: true,
      }).pipe(Effect.asVoid),
  }),
);

export class ResultsWorkflowsRpcClient extends ServiceMap.Service<
  ResultsWorkflowsRpcClient,
  RpcClient.RpcClient<
    RpcGroup.Rpcs<typeof ResultsWorkflowsRpc>,
    RpcClientError.RpcClientError
  >
>()("@typebot/ResultsWorkflowsRpcClient") {
  static readonly layer = Layer.effect(
    ResultsWorkflowsRpcClient,
    RpcClient.make(ResultsWorkflowsRpc),
  ).pipe(Layer.provide(WorkflowsRpcClientProtocolLayer));
}

export const ResultsWorkflowsRpcClientLayer = ResultsWorkflowsRpcClient.layer;
