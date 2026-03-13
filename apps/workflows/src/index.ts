import "./sentry";
import {
  BunClusterSocket,
  BunHttpServer,
  BunRuntime,
} from "@effect/platform-bun";
import { PgClient } from "@effect/sql-pg";
import {
  NextAuthConfig,
  WorkflowsDatabaseConfig,
  WorkflowsServerConfig,
} from "@typebot.io/config";
import { RPC_SECRET_HEADER_KEY } from "@typebot.io/config/constants";
import { NodemailerClientLayer } from "@typebot.io/lib/nodemailer/NodemailerClient";
import { RedisClientLayer } from "@typebot.io/lib/redis/RedisClient";
import { S3UploadClientLayer } from "@typebot.io/lib/s3/S3UploadClient";
import prisma from "@typebot.io/prisma";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { ResultsServiceLayer } from "@typebot.io/results/services/ResultsService";
import {
  ExportResultsWorkflowLayer,
  SendExportToEmailWorkflow,
  SendExportToEmailWorkflowLayer,
} from "@typebot.io/results/workflows/exportResultsWorkflow";
import {
  executeExportResultsWorkflowHandler,
  ResultsWorkflowsRpc,
} from "@typebot.io/results/workflows/rpc";
import { createTelemetryLayer } from "@typebot.io/telemetry/createTelemetryLayer";
import {
  reportWorkflowFailureToSentry,
  WorkflowSentryConfig,
} from "@typebot.io/telemetry/reportWorkflowFailureToSentry";
import { TypebotServiceLayer } from "@typebot.io/typebot/services/TypebotService";
import { UsersWorkflowsRpc } from "@typebot.io/user/workflows/rpc";
import {
  StartUserOnboardingWorkflow,
  StartUserOnboardingWorkflowLayer,
} from "@typebot.io/user/workflows/startUserOnboardingWorkflow";
import { Effect, Equivalence, Layer, Redacted, Stream } from "effect";
import { ClusterWorkflowEngine } from "effect/unstable/cluster";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { reportFatalCauseToSentry } from "./reportFatalCauseToSentry";

const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(BunClusterSocket.layer()),
  Layer.provideMerge(
    Layer.unwrap(
      Effect.gen(function* () {
        const config = yield* WorkflowsDatabaseConfig;
        return PgClient.layer({
          url: config.databaseUrl,
        });
      }),
    ),
  ),
);

const WorkflowLayer = Layer.mergeAll(
  ExportResultsWorkflowLayer,
  SendExportToEmailWorkflowLayer,
  StartUserOnboardingWorkflowLayer,
).pipe(Layer.provideMerge(WorkflowEngineLayer));

const PrismaLayer = Layer.provide(
  PrismaService.layer,
  Layer.succeed(PrismaClientService, prisma),
);

const AuthMiddleware = HttpRouter.middleware(
  Effect.gen(function* () {
    const { rpcSecret: expectedRpcSecret } = yield* WorkflowsServerConfig;

    return Effect.fn(function* (httpEffect) {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const rpcSecret = Redacted.make(request.headers[RPC_SECRET_HEADER_KEY]);

      if (
        !rpcSecret ||
        !Redacted.makeEquivalence(Equivalence.String)(
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

const ResultsWorkflowsRpcLayer = ResultsWorkflowsRpc.toLayer(
  Effect.succeed({
    ExecuteExportResultsWorkflow: (payload) =>
      executeExportResultsWorkflowHandler(payload).pipe(
        Stream.tapError((error) =>
          reportWorkflowFailureToSentry(error, {
            rpc: "ExecuteExportResultsWorkflow",
            workflow: "ExportResultsWorkflow",
            workflowId: payload.id,
            typebotId: payload.typebotId,
          }),
        ),
      ),
    SendExportToEmail: (payload) =>
      SendExportToEmailWorkflow.execute(payload, {
        discard: true,
      }).pipe(
        Effect.tapError((error) =>
          reportWorkflowFailureToSentry(error, {
            rpc: "SendExportToEmail",
            workflow: "SendExportToEmail",
            workflowId: payload.exportResultsWorkflowId,
            typebotId: payload.typebotId,
          }),
        ),
        Effect.asVoid,
      ),
  }),
);

const UsersWorkflowsRpcLayer = UsersWorkflowsRpc.toLayer(
  Effect.succeed({
    SendUserOnboardingEmail: (payload) =>
      StartUserOnboardingWorkflow.execute(payload, {
        discard: true,
      }).pipe(
        Effect.tapError((error) =>
          reportWorkflowFailureToSentry(error, {
            rpc: "SendUserOnboardingEmail",
            workflow: "StartUserOnboardingWorkflow",
            userId: payload.userId,
          }),
        ),
        Effect.asVoid,
      ),
  }),
);

const WorkflowsRpcRouterLayer = RpcServer.layerHttp({
  group: WorkflowsRpcGroup,
  path: "/rpc",
  protocol: "http",
}).pipe(
  Layer.provide(ResultsWorkflowsRpcLayer),
  Layer.provide(UsersWorkflowsRpcLayer),
  Layer.provide(AuthMiddleware),
  Layer.provide(RpcSerialization.layerNdjson),
);

const HealthRoute = HttpRouter.add(
  "GET",
  "/healthz",
  HttpServerResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

const Routes = Layer.mergeAll(HealthRoute, WorkflowsRpcRouterLayer);

const Main = HttpRouter.serve(Routes).pipe(
  Layer.provide(WorkflowLayer),
  Layer.provide(ResultsServiceLayer),
  Layer.provide(TypebotServiceLayer),
  Layer.provide(PrismaLayer),
  Layer.provide(S3UploadClientLayer),
  Layer.provide(NodemailerClientLayer),
  Layer.provide(RedisClientLayer),
  Layer.provide(
    Layer.unwrap(
      Effect.gen(function* () {
        const config = yield* WorkflowsServerConfig;
        return BunHttpServer.layer({
          port: config.port,
          hostname: "0.0.0.0",
        });
      }),
    ),
  ),
  Layer.provide(WorkflowsDatabaseConfig.layer),
  Layer.provide(WorkflowsServerConfig.layer),
  Layer.provide(WorkflowSentryConfig.layer),
  Layer.provide(NextAuthConfig.layer),
  Layer.provide(createTelemetryLayer("workflows")),
);

const MainProgram = Layer.launch(Main).pipe(
  Effect.tapCause(reportFatalCauseToSentry),
  Effect.provide(WorkflowSentryConfig.layer),
);

BunRuntime.runMain(MainProgram);
