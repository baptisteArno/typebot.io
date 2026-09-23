import { ORPCError } from "@orpc/server";
import { WorkflowsRpcClientConfig } from "@typebot.io/config";
import prisma from "@typebot.io/prisma";
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

export const getExportJobStatusInputSchema = z.object({
  typebotId: z.string(),
  workflowId: z.string(),
});

export const handleGetExportJobStatus = async ({
  input: { typebotId, workflowId },
  context: { user },
}: {
  input: z.infer<typeof getExportJobStatusInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  if (!workflowId.startsWith(`${typebotId}:`))
    throw new ORPCError("NOT_FOUND", { message: "Export job not found" });

  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      id: true,
      name: true,
      groups: true,
      collaborators: {
        where: { userId: user.id },
        select: { userId: true, type: true },
      },
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            where: { userId: user.id },
            select: { userId: true, role: true },
          },
        },
      },
    },
  });
  if (!typebot || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const program = Effect.gen(function* () {
    const rpcClient = yield* ResultsWorkflowsRpcClient;
    return yield* rpcClient.GetExportResultsWorkflowStatus({
      workflowId,
      typebotId,
    });
  }).pipe(
    Effect.withSpan("handleGetExportJobStatus", {
      attributes: { typebotId, workflowId },
      root: true,
    }),
  );

  return Effect.runPromise(program.pipe(Effect.provide(MainLayer)));
};
