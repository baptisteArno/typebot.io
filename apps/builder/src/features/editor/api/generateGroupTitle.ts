import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const generateGroupTitle = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      groupIndex: z.number(),
      groupContent: z.any(),
      setTypebot: z.any(),
    }),
  )
  .output(z.object({ title: z.string() }))
  .mutation(async ({ input }) => {
    // Double check if AI features are enabled in the workspace
    const workspace = await prisma.workspace.findFirst({
      where: { id: input.workspaceId },
      select: {
        aiFeatureCredentialId: true,
        aiFeaturePrompt: true,
        inEditorAiFeaturesEnabled: true,
      },
    });

    if (
      !workspace?.aiFeatureCredentialId ||
      !workspace?.aiFeaturePrompt ||
      !workspace?.inEditorAiFeaturesEnabled
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "AI features not enabled!",
      });
    }

    // TODO:
    // Fetch credential using workspace.aiFeatureCredentialId
    // Fetch prompt using workspace.aiFeaturePrompt
    // Execute AI call to the corresponing LLM model based on the credential type

    return { title: `Custom title` };
  });
