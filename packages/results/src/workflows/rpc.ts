import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { Rpc, RpcClient, RpcGroup, RpcSerialization } from "@effect/rpc";
import { WorkflowsRpcClientConfig } from "@typebot.io/config";
import {
  RedisClient,
  RedisSubscribeError,
} from "@typebot.io/lib/redis/RedisClient";
import {
  Cause,
  Effect,
  Fiber,
  Layer,
  Option,
  Redacted,
  Schema,
  Stream,
} from "effect";
import {
  EXPORT_PROGRESS_CHANNEL_PREFIX,
  ExportResultsWorkflow,
  SendExportToEmailWorkflow,
} from "./exportResultsWorkflow";

export const RPC_SECRET_HEADER_KEY = "x-rpc-secret";

const ExportResultsWorkflowStatusChunk = Schema.Union(
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
);

export type ExportResultsWorkflowStatusChunk = Schema.Schema.Type<
  typeof ExportResultsWorkflowStatusChunk
>;

export class ResultsWorkflowsRpc extends RpcGroup.make(
  Rpc.make("ExecuteExportResultsWorkflow", {
    success: ExportResultsWorkflowStatusChunk,
    error: Schema.Union(RedisSubscribeError, ExportResultsWorkflow.errorSchema),
    stream: true,
    payload: ExportResultsWorkflow.payloadSchema,
  }),
  Rpc.make("SendExportToEmail", {
    error: SendExportToEmailWorkflow.errorSchema,
    payload: SendExportToEmailWorkflow.payloadSchema,
  }),
) {}

export const executeExportResultsWorkflowHandler = (payload: {
  readonly id: string;
  readonly typebotId: string;
  readonly includeDeletedBlocks?: boolean;
}) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient;

    const progressStream = redis.subscribe(
      `${EXPORT_PROGRESS_CHANNEL_PREFIX}${payload.id}`,
    );

    const workflowFiber = yield* ExportResultsWorkflow.execute(payload).pipe(
      Effect.fork,
    );

    const interruptProgress = Fiber.await(workflowFiber).pipe(Effect.as(true));

    return Stream.concat(
      Stream.succeed({
        status: "starting" as const,
        workflowId: payload.id,
      }),
      Stream.concat(
        Stream.map(progressStream, (message) => ({
          status: "in_progress" as const,
          progress: Number.parseFloat(message),
        })).pipe(
          Stream.takeWhile((message) => message.progress !== 100),
          Stream.interruptWhen(interruptProgress),
        ),
        Stream.fromEffect(
          Fiber.join(workflowFiber).pipe(
            Effect.map((result) => ({
              status: "completed" as const,
              fileUrl: result.fileUrl.toString(),
            })),
          ),
        ),
      ),
    ).pipe(
      Stream.tapErrorCause((cause) =>
        Effect.logError("Export workflow failed").pipe(
          Effect.annotateLogs({
            workflowId: payload.id,
            typebotId: payload.typebotId,
            cause: Cause.pretty(cause, { renderErrorCause: true }),
          }),
        ),
      ),
    );
  }).pipe(Stream.unwrap);

export const ResultsWorkflowsRpcLayer = ResultsWorkflowsRpc.toLayer(
  Effect.succeed({
    ExecuteExportResultsWorkflow: executeExportResultsWorkflowHandler,
    SendExportToEmail: (payload) =>
      SendExportToEmailWorkflow.execute(payload, {
        discard: true,
      }),
  }),
);

// Client

const ProtocolLive = Effect.gen(function* () {
  const { rpcSecret, rpcUrl } = yield* WorkflowsRpcClientConfig;
  return RpcClient.layerProtocolHttp({
    url: Option.getOrElse(
      rpcUrl,
      () => new URL("http://localhost:3007/rpc"),
    ).toString(),
    transformClient: (client) =>
      HttpClient.mapRequest(client, (request) =>
        request.pipe(
          HttpClientRequest.setHeader(
            RPC_SECRET_HEADER_KEY,
            Redacted.value(rpcSecret),
          ),
        ),
      ),
  });
}).pipe(
  Layer.unwrapEffect,
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson),
);

export class ResultsWorkflowsRpcClient extends Effect.Service<ResultsWorkflowsRpcClient>()(
  "@typebot/ResultsWorkflowsRpcClient",
  {
    scoped: RpcClient.make(ResultsWorkflowsRpc),
    dependencies: [ProtocolLive],
  },
) {}
