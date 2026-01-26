import { ORPCError } from "@orpc/server";
import { WorkflowsRpcClientConfig } from "@typebot.io/config";
import { createId } from "@typebot.io/lib/createId";
import prisma from "@typebot.io/prisma";
import type { ExportResultsWorkflowStatusChunk } from "@typebot.io/results/workflows/rpc";
import { ResultsWorkflowsRpcClient } from "@typebot.io/results/workflows/rpc";
import { TelemetryLayer } from "@typebot.io/telemetry/telemetryLayer";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { Cause, Effect, Layer, Queue, Stream } from "effect";
import { z } from "zod";

const MainLayer = Layer.provideMerge(
  Layer.provide(
    ResultsWorkflowsRpcClient.Default,
    WorkflowsRpcClientConfig.layer,
  ),
  TelemetryLayer,
);

export const streamExportJobInputSchema = z.object({
  typebotId: z.string(),
  includeDeletedBlocks: z.boolean().optional(),
});

export const exportResultsWorkflowStatusChunkSchema = z.discriminatedUnion(
  "status",
  [
    z.object({ status: z.literal("starting"), workflowId: z.string() }),
    z.object({ status: z.literal("in_progress"), progress: z.number() }),
    z.object({ status: z.literal("completed"), fileUrl: z.string() }),
    z.object({ status: z.literal("error"), message: z.string() }),
  ],
);

export async function* handleStreamExportJob({
  input: { typebotId, includeDeletedBlocks },
  context: { user },
}: {
  input: z.infer<typeof streamExportJobInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}): AsyncGenerator<z.infer<typeof exportResultsWorkflowStatusChunkSchema>> {
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
      name: true,
      groups: true,
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });
  if (!typebot || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const queue = await Effect.runPromise(
    Queue.unbounded<ExportResultsWorkflowStatusChunk | null>(),
  );

  const program = Effect.gen(function* () {
    const rpcClient = yield* ResultsWorkflowsRpcClient;

    const stream = rpcClient.ExecuteExportResultsWorkflow({
      id: createId(),
      typebotId,
      includeDeletedBlocks,
    });

    yield* stream.pipe(
      Stream.tapErrorCause((cause) =>
        Effect.logError("Export workflow failed").pipe(
          Effect.annotateLogs({
            typebotId,
            cause: Cause.pretty(cause, { renderErrorCause: true }),
          }),
        ),
      ),
      Stream.runForEach((chunk) => Queue.offer(queue, chunk)),
    );
  }).pipe(
    Effect.catchAllCause((cause) =>
      Queue.offer(queue, {
        status: "error",
        message: Cause.prettyErrors(cause)
          .map((error) => error.message)
          .join("\n"),
      }),
    ),
    Effect.ensuring(Queue.offer(queue, null)),
    Effect.withSpan("handleStreamExportJob", {
      attributes: { typebotId },
      root: true,
    }),
  );

  Effect.runFork(program.pipe(Effect.provide(MainLayer)));

  while (true) {
    const chunk = await Effect.runPromise(Queue.take(queue));
    if (chunk === null) {
      break;
    }
    yield chunk;
  }
}
