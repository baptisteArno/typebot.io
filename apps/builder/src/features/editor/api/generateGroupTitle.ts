import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const generateGroupTitle = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      groupIndex: z.number(),
      groupContent: z.any(),
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

    const credentials = await prisma.credentials.findFirst({
      where: {
        id: workspace.aiFeatureCredentialId,
      },
      select: {
        data: true,
        iv: true,
        name: true,
        type: true,
      },
    });

    if (!credentials)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });

    const credentialsData = await decrypt(credentials.data, credentials.iv);
    console.log({ credentials, credentialsData });

    const aiProvider = credentials.type;
    const savedPrompt = workspace.aiFeaturePrompt;
    let generateGroupTitle = "";

    switch (aiProvider) {
      case "openai":
        // Call OpenAI API
        generateGroupTitle = "OpenAI title";
        break;
      case "open-router":
        // Call OpenRouter API
        generateGroupTitle = "OpenRouter title";
        break;
      case "anthropic":
        // Call Anthropic API
        generateGroupTitle = "Anthropic title";
        break;
      default:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid AI provider",
        });
    }

    return { title: generateGroupTitle };
  });
