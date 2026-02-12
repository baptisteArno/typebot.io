import { ClusterWorkflowEngine } from "@effect/cluster";
import { NodeSdk } from "@effect/opentelemetry";
import {
  HttpLayerRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import {
  BunClusterSocket,
  BunHttpServer,
  BunRuntime,
} from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { PgClient } from "@effect/sql-pg";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
  NextAuthConfig,
  S3ConfigLayer,
  WorkflowsDatabaseConfig,
  WorkflowsServerConfig,
} from "@typebot.io/config";
import { RPC_SECRET_HEADER_KEY } from "@typebot.io/config/constants";
import { NodemailerClientLayer } from "@typebot.io/lib/nodemailer/NodemailerClient";
import { RedisClientLayer } from "@typebot.io/lib/redis/RedisClient";
import prisma from "@typebot.io/prisma";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { ResultsServiceLayer } from "@typebot.io/results/services/ResultsService";
import {
  ExportResultsWorkflowLayer,
  SendExportToEmailWorkflowLayer,
} from "@typebot.io/results/workflows/exportResultsWorkflow";
import {
  ResultsWorkflowsRpc,
  ResultsWorkflowsRpcLayer,
} from "@typebot.io/results/workflows/rpc";
import { TypebotServiceLayer } from "@typebot.io/typebot/services/TypebotService";
import {
  UsersWorkflowsRpc,
  UsersWorkflowsRpcLayer,
} from "@typebot.io/user/workflows/rpc";
import { StartUserOnboardingWorkflowLayer } from "@typebot.io/user/workflows/startUserOnboardingWorkflow";
import { Effect, Equivalence, Layer, Redacted } from "effect";

const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(BunClusterSocket.layer()),
  Layer.provideMerge(
    WorkflowsDatabaseConfig.pipe(
      Effect.map((config) =>
        PgClient.layer({
          url: config.databaseUrl,
        }),
      ),
      Layer.unwrapEffect,
    ),
  ),
);

const WorkflowLayer = Layer.mergeAll(
  ExportResultsWorkflowLayer,
  SendExportToEmailWorkflowLayer,
  StartUserOnboardingWorkflowLayer,
).pipe(Layer.provideMerge(WorkflowEngineLayer));

const PrismaLayer = Layer.provide(
  PrismaService.Default,
  Layer.succeed(PrismaClientService, prisma),
);

const AuthMiddleware = HttpLayerRouter.middleware(
  Effect.gen(function* () {
    const { rpcSecret: expectedRpcSecret } = yield* WorkflowsServerConfig;

    return Effect.fn(function* (httpEffect) {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const rpcSecret = Redacted.make(request.headers[RPC_SECRET_HEADER_KEY]);

      if (
        !rpcSecret ||
        !Redacted.getEquivalence(Equivalence.string)(
          rpcSecret,
          expectedRpcSecret,
        )
      ) {
        return yield* HttpServerResponse.json(
          {
            error: "Unauthorized",
            message: "Missing or invalid authorization header",
          },
          { status: 401 },
        );
      }

      return yield* httpEffect;
    });
  }),
).layer;

const WorkflowsRpcGroup = ResultsWorkflowsRpc.merge(UsersWorkflowsRpc);

const WorkflowsRpcRouterLayer = RpcServer.layerHttpRouter({
  group: WorkflowsRpcGroup,
  path: "/rpc",
  protocol: "http",
}).pipe(
  Layer.provide(ResultsWorkflowsRpcLayer),
  Layer.provide(UsersWorkflowsRpcLayer),
  Layer.provide(AuthMiddleware),
  Layer.provide(RpcSerialization.layerNdjson),
);

const HealthRoute = HttpLayerRouter.add(
  "GET",
  "/healthz",
  HttpServerResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

const OtelNodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "workflows" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter()),
}));

const Routes = Layer.mergeAll(HealthRoute, WorkflowsRpcRouterLayer);

const Main = HttpLayerRouter.serve(Routes).pipe(
  Layer.provide(WorkflowLayer),
  Layer.provide(ResultsServiceLayer),
  Layer.provide(TypebotServiceLayer),
  Layer.provide(PrismaLayer),
  Layer.provide(S3ConfigLayer),
  Layer.provide(NodemailerClientLayer),
  Layer.provide(RedisClientLayer),
  Layer.provide(
    WorkflowsServerConfig.pipe(
      Effect.map((config) =>
        BunHttpServer.layer({
          port: config.port,
          hostname: "0.0.0.0",
        }),
      ),
      Layer.unwrapEffect,
    ),
  ),
  Layer.provide(WorkflowsDatabaseConfig.layer),
  Layer.provide(WorkflowsServerConfig.layer),
  Layer.provide(NextAuthConfig.layer),
  Layer.provide(OtelNodeSdkLive),
);

BunRuntime.runMain(Layer.launch(Main));
