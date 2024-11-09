import { authenticatedProcedure } from "@/helpers/server/trpc";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { generateText } from "ai";

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
    const apiKey = (credentialsData as any).apiKey;

    const aiProvider = credentials.type;
    const savedPrompt = workspace.aiFeaturePrompt;
    const groupContent = JSON.stringify(input.groupContent.blocks);

    const generateTitle = async () => {
      const prompt = `${savedPrompt}\n\nGroup Content: ${groupContent}\n\nGenerate a concise and relevant title for this group:`;

      let model;
      // Need to improve further to allow users to select the model along with the provider
      switch (aiProvider) {
        case "openai":
          model = createOpenAI({
            apiKey,
            compatibility: "strict",
          })("gpt-4o-mini");
          break;
        case "open-router":
          model = createOpenAI({
            apiKey,
            compatibility: "strict",
            baseURL: "https://openrouter.ai/api/v1",
          })("gpt-4o-mini");
          break;
        case "anthropic":
          model = createAnthropic({
            apiKey,
          })("claude-3-5-sonnet-20241022");
          break;
        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid AI provider",
          });
      }

      const { text } = await generateText({
        model,
        prompt,
      });

      if (text.trim().startsWith(`"`) && text.trim().endsWith(`"`)) {
        return text.trim().slice(1, -1);
      }
      return text.trim();
    };

    try {
      const generatedTitle = await generateTitle();
      return { title: generatedTitle };
    } catch (error) {
      console.error("Error generating group title:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate group title",
      });
    }
  });
