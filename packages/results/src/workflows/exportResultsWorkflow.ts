import { NextAuthConfig } from "@typebot.io/config";
import { listSuppressedEmails } from "@typebot.io/emails/helpers/suppressedEmails";
import { renderResultsExportLinkEmail } from "@typebot.io/emails/transactional/ResultsExportLinkEmail";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import {
  NodemailerClient,
  NodemailerError,
} from "@typebot.io/lib/nodemailer/NodemailerClient";
import { RedisClient } from "@typebot.io/lib/redis/RedisClient";
import { S3UploadClient } from "@typebot.io/lib/s3/S3UploadClient";
import { reportWorkflowFailureToSentry } from "@typebot.io/telemetry/reportWorkflowFailureToSentry";
import { TypebotService } from "@typebot.io/typebot/services/TypebotService";
import { Effect, Layer, Option, Ref, Schema, ServiceMap } from "effect";
import { PlatformError } from "effect/PlatformError";
import { Activity, Workflow } from "effect/unstable/workflow";
import { getExportFileName } from "../getExportFileName";
import {
  ProgressReporter,
  ProgressReporterError,
  streamResultsToCsvV2,
} from "../streamAllResultsToCsvV2";

// Errors
export class PrismaConnectionError extends Schema.TaggedErrorClass<PrismaConnectionError>()(
  "PrismaConnectionError",
  {
    message: Schema.String,
  },
) {}

export class TypebotNotFoundError extends Schema.TaggedErrorClass<TypebotNotFoundError>()(
  "@typebot/TypebotNotFoundError",
  {},
) {}

export class TypebotVersionTooLowError extends Schema.TaggedErrorClass<TypebotVersionTooLowError>()(
  "@typebot/TypebotVersionTooLowError",
  {},
) {}

export class TooManyAttemptsError extends Schema.TaggedErrorClass<TooManyAttemptsError>()(
  "@typebot/TooManyAttemptsError",
  {
    message: Schema.String,
  },
) {}

export class S3UploadError extends Schema.TaggedErrorClass<S3UploadError>()(
  "@typebot/S3UploadError",
  {
    message: Schema.String,
  },
) {}

export class RedisConfigError extends Schema.TaggedErrorClass<RedisConfigError>()(
  "@typebot/RedisConfigError",
  {
    message: Schema.String,
  },
) {}

export const ExportResultsWorkflow = Workflow.make({
  name: "ExportResultsWorkflow",
  success: Schema.Struct({
    fileUrl: Schema.URL,
    typebotName: Schema.String,
  }),
  error: Schema.Union([
    PrismaConnectionError,
    TypebotNotFoundError,
    TooManyAttemptsError,
    TypebotVersionTooLowError,
    RedisConfigError,
    Schema.instanceOf(PlatformError),
    S3UploadError,
    ProgressReporterError,
    NodemailerError,
  ]),
  payload: {
    id: Schema.String,
    typebotId: Schema.String,
    includeDeletedBlocks: Schema.Boolean.pipe(Schema.optional),
  },
  idempotencyKey: ({ id }) => id,
});

export const ExportResultsWorkflowLayer = ExportResultsWorkflow.toLayer(
  Effect.fnUntraced(function* (payload, executionId) {
    yield* Effect.annotateLogsScoped({
      workflowId: payload.id,
      typebotId: payload.typebotId,
      executionId,
    });

    const { nextAuthUrl } = yield* NextAuthConfig;

    const typebot = yield* Activity.make({
      name: "GetTypebot",
      error: Schema.Union([
        PrismaConnectionError,
        TypebotNotFoundError,
        TooManyAttemptsError,
        TypebotVersionTooLowError,
      ]),
      success: Schema.Struct({
        id: Schema.String,
        groups: Schema.Any,
        variables: Schema.Any,
        name: Schema.String,
        publicId: Schema.NullOr(Schema.String),
        resultsTablePreferences: Schema.Any,
        workspaceId: Schema.String,
      }),
      execute: Effect.gen(function* () {
        const totalAttempts = yield* Activity.CurrentAttempt;
        if (totalAttempts >= 3) {
          return yield* new TooManyAttemptsError({
            message: `Typebot lookup failed after ${totalAttempts} attempts`,
          });
        }
        const typebotService = yield* TypebotService;
        const typebot = yield* typebotService.findUnique({
          where: {
            id: payload.typebotId,
          },
          select: {
            id: true,
            name: true,
            publicId: true,
            version: true,
            groups: true,
            variables: true,
            workspaceId: true,
            resultsTablePreferences: true,
          },
        });

        if (!typebot) return yield* new TypebotNotFoundError();

        if (Number(typebot.version) < 6)
          return yield* new TypebotVersionTooLowError();

        return {
          ...typebot,
          groups: parseGroups(typebot.groups, {
            typebotVersion: typebot.version,
          }),
        };
      }).pipe(
        Effect.tapError((error) => Effect.logError(error)),
        Activity.retry({
          times: 3,
        }),
      ),
    });

    const fileName = getExportFileName({
      id: payload.typebotId,
      name: typebot.name,
      publicId: typebot.publicId,
    });

    const s3Key = `private/tmp/workspaces/${typebot.workspaceId}/typebots/${payload.typebotId}/results-exports/${fileName}`;

    yield* Activity.make({
      name: "ExportResultsToS3",
      error: Schema.Union([
        PrismaConnectionError,
        Schema.instanceOf(PlatformError),
        TooManyAttemptsError,
        RedisConfigError,
        ProgressReporterError,
        S3UploadError,
      ]),
      success: Schema.Struct({
        totalRowsExported: Schema.Number,
      }),
      execute: Effect.gen(function* () {
        const totalAttempts = yield* Activity.CurrentAttempt;
        if (totalAttempts > 2) {
          return yield* new TooManyAttemptsError({
            message: `ExportResultsToS3 failed after ${totalAttempts} attempts`,
          });
        }

        const { csvStream, totalRowsExportedRef } = yield* streamResultsToCsvV2(
          typebot,
          {
            includeDeletedBlocks: payload.includeDeletedBlocks,
          },
        );

        const s3UploadClient = yield* S3UploadClient;

        yield* s3UploadClient
          .uploadObject({
            key: s3Key,
            body: csvStream,
          })
          .pipe(
            Effect.tapError((error) => Effect.logError(error)),
            Effect.mapError(
              (error) =>
                new S3UploadError({
                  message:
                    error instanceof Error ? error.message : "Unknown error",
                }),
            ),
          );

        const totalRowsExported = yield* Ref.get(totalRowsExportedRef);

        return { totalRowsExported };
      }).pipe(
        Effect.provide(
          ProgressReporterRedisLayer.pipe(
            Layer.provide(Layer.succeed(WorkflowId, payload.id)),
          ),
        ),
        Effect.tapError((error) => Effect.logError(error)),
        Activity.retry({
          times: 2,
        }),
      ),
    });

    const fileUrl = new URL(`/api/s3/${s3Key}`, nextAuthUrl);

    return {
      fileUrl,
      typebotName: typebot.name,
    };
  }),
);

export const SendExportToEmailWorkflow = Workflow.make({
  name: "SendExportToEmail",
  payload: {
    exportResultsWorkflowId: Schema.String,
    email: Schema.String,
    typebotId: Schema.String,
  },
  error: NodemailerError,
  idempotencyKey: ({ exportResultsWorkflowId }) => exportResultsWorkflowId,
});

export const SendExportToEmailWorkflowLayer = SendExportToEmailWorkflow.toLayer(
  Effect.fnUntraced(
    function* (payload, executionId) {
      yield* Effect.annotateLogsScoped({
        exportResultsWorkflowId: payload.exportResultsWorkflowId,
        email: payload.email,
        typebotId: payload.typebotId,
        executionId,
      });

      const exportResult = yield* ExportResultsWorkflow.execute({
        id: payload.exportResultsWorkflowId,
        typebotId: payload.typebotId,
      }).pipe(Effect.timeout("1 hour"), Effect.option);

      if (Option.isNone(exportResult)) {
        yield* Effect.logWarning("Export timed out, skipping email");
        return;
      }

      const emptySuppressedEmails: string[] = [];
      const suppressedEmails = yield* listSuppressedEmails([
        payload.email,
      ]).pipe(
        Effect.catch((error) =>
          Effect.logError("Suppressed email check failed").pipe(
            Effect.annotateLogs({ error: String(error), email: payload.email }),
            Effect.as(emptySuppressedEmails),
          ),
        ),
      );

      if (suppressedEmails.length > 0) {
        yield* Effect.logWarning(
          "Email suppressed, skipping export email",
        ).pipe(Effect.annotateLogs({ email: payload.email, suppressedEmails }));
        return;
      }

      yield* Activity.make({
        name: "SendEmail",
        error: NodemailerError,
        execute: Effect.gen(function* () {
          const emailClient = yield* NodemailerClient;
          const html = yield* Effect.tryPromise({
            try: () =>
              renderResultsExportLinkEmail({
                email: payload.email,
                typebotName: exportResult.value.typebotName,
                fileUrl: exportResult.value.fileUrl.toString(),
              }),
            catch: (error) => new NodemailerError({ cause: error }),
          });
          yield* emailClient.sendMail({
            to: payload.email,
            subject: "Your results export is ready",
            html,
          });
        }),
      })
        .asEffect()
        .pipe(
          Effect.tapError((error) =>
            Effect.logError("SendEmail activity failed").pipe(
              Effect.annotateLogs({
                error: String(error),
                email: payload.email,
              }),
            ),
          ),
        );
    },
    (effect, payload) =>
      effect.pipe(
        Effect.tapError((error) =>
          reportWorkflowFailureToSentry(error, {
            rpc: "SendExportToEmail",
            workflow: "SendExportToEmail",
            workflowId: payload.exportResultsWorkflowId,
            typebotId: payload.typebotId,
          }),
        ),
      ),
  ),
);

class WorkflowId extends ServiceMap.Service<WorkflowId, string>()(
  "@typebot/WorkflowId",
) {}

export const EXPORT_PROGRESS_CHANNEL_PREFIX = "export-progress-";

export const ProgressReporterRedisLayer = Layer.unwrap(
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    const exportId = yield* WorkflowId;

    return Layer.succeed(
      ProgressReporter,
      ProgressReporter.of({
        report: (progress) =>
          redis
            .publish(
              `${EXPORT_PROGRESS_CHANNEL_PREFIX}${exportId}`,
              progress.toString(),
            )
            .pipe(
              Effect.mapError(
                (error) =>
                  new ProgressReporterError({
                    message: error.message,
                  }),
              ),
            ),
      }),
    );
  }),
);
