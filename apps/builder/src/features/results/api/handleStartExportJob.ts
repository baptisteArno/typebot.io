import { ORPCError } from "@orpc/server";
import { WorkflowsRpcClientConfig } from "@typebot.io/config";
import { createId } from "@typebot.io/lib/createId";
import prisma from "@typebot.io/prisma";
import { timeFilterValues } from "@typebot.io/results/timeFilter";
import { ResultsWorkflowsRpcClient } from "@typebot.io/results/workflows/rpc";
import { createGlobalTelemetryLayer } from "@typebot.io/telemetry/createGlobalTelemetryLayer";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { z } from "zod";

const MainLayer = Layer.provideMerge(
  Layer.provide(
    ResultsWorkflowsRpcClient.layer,
    WorkflowsRpcClientConfig.layer,
  ),
  createGlobalTelemetryLayer("builder"),
);

export const startExportJobInputSchema = z.object({
  typebotId: z.string(),
  includeDeletedBlocks: z.boolean().optional(),
  timeFilter: z.enum(timeFilterValues).default("allTime"),
  timeZone: z.string().optional(),
});

export const handleStartExportJob = async ({
  input: { typebotId, includeDeletedBlocks, timeFilter, timeZone },
  context: { user },
}: {
  input: z.infer<typeof startExportJobInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
      name: true,
      groups: true,
      collaborators: {
        where: { userId: user.id },
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
            where: { userId: user.id },
            select: {
              userId: true,
              role: true,
            },
          },
        },
      },
    },
  });
  if (!typebot || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const workflowId = `${typebotId}:${createId()}`;
  const program = Effect.gen(function* () {
    const rpcClient = yield* ResultsWorkflowsRpcClient;
    return yield* rpcClient.StartExportResultsWorkflow({
      id: workflowId,
      typebotId,
      includeDeletedBlocks,
      timeFilter,
      timeZone,
    });
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Failed to start results export").pipe(
        Effect.annotateLogs({ typebotId, workflowId, error: String(error) }),
      ),
    ),
    Effect.withSpan("handleStartExportJob", {
      attributes: { typebotId },
      root: true,
    }),
  );
  return Effect.runPromise(program.pipe(Effect.provide(MainLayer)));
};
