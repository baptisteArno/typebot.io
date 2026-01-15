import { FileSystem } from "@effect/platform";
import { PlatformError } from "@effect/platform/Error";
import { Activity, Workflow } from "@effect/workflow";
import { MultipartUpload } from "@effect-aws/s3";
import { S3ReadableConfig } from "@typebot.io/config";
import { renderResultsExportLinkEmail } from "@typebot.io/emails/transactional/ResultsExportLinkEmail";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import {
  NodemailerClient,
  NodemailerError,
} from "@typebot.io/lib/nodemailer/NodemailerClient";
import { RedisClient } from "@typebot.io/lib/redis/RedisClient";
import { TypebotService } from "@typebot.io/typebot/services/TypebotService";
import { Context, Effect, Layer, Option, Schema } from "effect";
import { getExportFileName } from "../getExportFileName";
import {
  ProgressReporter,
  ProgressReporterError,
  streamResultsToCsvV2,
} from "../streamAllResultsToCsvV2";

// Errors
export class PrismaConnectionError extends Schema.TaggedError<PrismaConnectionError>()(
  "PrismaConnectionError",
  {
    message: Schema.String,
  },
) {}

export class TypebotNotFoundError extends Schema.TaggedError<TypebotNotFoundError>()(
  "@typebot/TypebotNotFoundError",
  {},
) {}

export class TypebotVersionTooLowError extends Schema.TaggedError<TypebotVersionTooLowError>()(
  "@typebot/TypebotVersionTooLowError",
  {},
) {}

export class TooManyAttemptsError extends Schema.TaggedError<TooManyAttemptsError>()(
  "@typebot/TooManyAttemptsError",
  {
    message: Schema.String,
  },
) {}

export class S3UploadError extends Schema.TaggedError<S3UploadError>()(
  "@typebot/S3UploadError",
  {
    message: Schema.String,
  },
) {}

export class RedisConfigError extends Schema.TaggedError<RedisConfigError>()(
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
  error: Schema.Union(
    PrismaConnectionError,
    TypebotNotFoundError,
    TooManyAttemptsError,
    TypebotVersionTooLowError,
    RedisConfigError,
    PlatformError,
    S3UploadError,
    ProgressReporterError,
    NodemailerError,
  ),
  payload: {
    id: Schema.String,
    typebotId: Schema.String,
    includeDeletedBlocks: Schema.Boolean.pipe(Schema.optional),
  },
  idempotencyKey: ({ id }) => id,
});

export const ExportResultsWorkflowLayer = ExportResultsWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.annotateCurrentSpan({
      workflowId: payload.id,
      typebotId: payload.typebotId,
      executionId,
    });

    yield* Effect.annotateLogsScoped({
      workflowId: payload.id,
      typebotId: payload.typebotId,
      executionId,
    });

    yield* Effect.logInfo("Export workflow started");

    const typebot = yield* Activity.make({
      name: "GetTypebot",
      error: Schema.Union(
        PrismaConnectionError,
        TypebotNotFoundError,
        TooManyAttemptsError,
        TypebotVersionTooLowError,
      ),
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
        if (totalAttempts > 3) {
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
          }) as GroupV6[],
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

    const tmpPath = `.effect/tmp/workspaces/${typebot.workspaceId}/typebots/${payload.typebotId}/results-exports/${fileName}`;
    const s3Key = `private/tmp/workspaces/${typebot.workspaceId}/typebots/${payload.typebotId}/results-exports/${fileName}`;

    yield* Effect.logDebug("File name: %s", fileName);

    const { totalRowsExported } = yield* Activity.make({
      name: "StreamResultsToLocalFile",
      error: Schema.Union(
        PrismaConnectionError,
        PlatformError,
        TooManyAttemptsError,
        RedisConfigError,
        ProgressReporterError,
      ),
      success: Schema.Struct({
        totalRowsExported: Schema.Number,
      }),
      execute: Effect.gen(function* () {
        yield* Effect.logDebug("Streaming results to local file...");
        const totalAttempts = yield* Activity.CurrentAttempt;
        if (totalAttempts > 2) {
          return yield* new TooManyAttemptsError({
            message: `StreamResultsToLocalFile failed after ${totalAttempts} attempts`,
          });
        }

        return yield* streamResultsToCsvV2(typebot, {
          outputPath: tmpPath,
          includeDeletedBlocks: payload.includeDeletedBlocks,
        });
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

    const fs = yield* FileSystem.FileSystem;

    yield* Activity.make({
      name: "UploadFileToBucket",
      error: Schema.Union(S3UploadError, PlatformError),
      execute: Effect.gen(function* () {
        yield* Effect.logDebug("Uploading file to bucket...");
        const s3Config = yield* S3ReadableConfig;
        const fs = yield* FileSystem.FileSystem;

        yield* MultipartUpload.uploadObject({
          Bucket: s3Config.bucket,
          Key: s3Key,
          Body: yield* fs.readFile(tmpPath),
        }).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.mapError(
            (error) =>
              new S3UploadError({
                message:
                  error instanceof Error ? error.message : "Unknown error",
              }),
          ),
        );
      }),
    });

    yield* fs.remove(tmpPath, { recursive: true });

    const fileUrl = new URL(`http://localhost:3000/api/s3/${s3Key}`);

    yield* Effect.logInfo("Export workflow completed").pipe(
      Effect.annotateLogs({
        totalRowsExported,
      }),
    );

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
  error: Schema.Union(NodemailerError),
  idempotencyKey: ({ exportResultsWorkflowId }) => exportResultsWorkflowId,
});

export const SendExportToEmailWorkflowLayer = SendExportToEmailWorkflow.toLayer(
  Effect.fn(function* (payload) {
    yield* Effect.annotateCurrentSpan({
      exportResultsWorkflowId: payload.exportResultsWorkflowId,
      email: payload.email,
      typebotId: payload.typebotId,
    });
    yield* Effect.annotateLogsScoped({
      exportResultsWorkflowId: payload.exportResultsWorkflowId,
      email: payload.email,
      typebotId: payload.typebotId,
    });

    const exportResult = yield* ExportResultsWorkflow.execute({
      id: payload.exportResultsWorkflowId,
      typebotId: payload.typebotId,
    }).pipe(Effect.timeout("1 hour"), Effect.option);

    if (Option.isNone(exportResult)) {
      yield* Effect.logWarning("Export timed out, skipping email");
      return;
    }

    yield* Effect.logInfo("Sending email...");

    yield* Activity.make({
      name: "SendEmail",
      error: Schema.Union(NodemailerError),
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
          subject: `Your results export is ready`,
          html,
        });
      }),
    }).pipe(
      Effect.tapError((error) =>
        Effect.logError("SendEmail activity failed").pipe(
          Effect.annotateLogs({ error: String(error), email: payload.email }),
        ),
      ),
    );
  }),
);

class WorkflowId extends Context.Tag("@typebot/WorkflowId")<
  WorkflowId,
  string
>() {}

export const EXPORT_PROGRESS_CHANNEL_PREFIX = "export-progress-";

export const ProgressReporterRedisLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    const exportId = yield* WorkflowId;

    return Layer.succeed(ProgressReporter, {
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
                  message: `[${error.cause}] ${error.message}`,
                }),
            ),
          ),
    });
  }),
);
