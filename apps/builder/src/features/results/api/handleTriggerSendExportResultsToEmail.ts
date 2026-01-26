import { ORPCError } from "@orpc/server";
import { WorkflowsRpcClientConfig } from "@typebot.io/config";
import prisma from "@typebot.io/prisma";
import { ResultsWorkflowsRpcClient } from "@typebot.io/results/workflows/rpc";
import { TelemetryLayer } from "@typebot.io/telemetry/telemetryLayer";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { z } from "zod";

const MainLayer = Layer.provideMerge(
  Layer.provide(
    ResultsWorkflowsRpcClient.Default,
    WorkflowsRpcClientConfig.layer,
  ),
  TelemetryLayer,
);

export const triggerSendExportResultsToEmailInputSchema = z.object({
  typebotId: z.string(),
  workflowId: z.string(),
});

export const handleTriggerSendExportResultsToEmail = async ({
  input: { typebotId, workflowId },
  context: { user },
}: {
  input: z.infer<typeof triggerSendExportResultsToEmailInputSchema>;
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

  const program = Effect.gen(function* () {
    const client = yield* ResultsWorkflowsRpcClient;
    yield* client.SendExportToEmail({
      exportResultsWorkflowId: workflowId,
      email: user.email,
      typebotId,
    });
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("SendExportToEmail trigger failed").pipe(
        Effect.annotateLogs({ typebotId, workflowId, error: String(error) }),
      ),
    ),
    Effect.withSpan("handleTriggerSendExportResultsToEmail", {
      attributes: { typebotId },
      root: true,
    }),
  );

  await Effect.runPromise(program.pipe(Effect.provide(MainLayer)));

  return { message: "Workflow sent to email" };
};
