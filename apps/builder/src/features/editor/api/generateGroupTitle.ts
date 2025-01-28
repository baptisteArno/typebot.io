import { isWriteTypebotForbidden } from "@/features/typebot/helpers/isWriteTypebotForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import prisma from "@typebot.io/prisma";
import {
  type aiProviders,
  workspaceSchema,
} from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { generateObject } from "ai";

export const generateGroupTitle = authenticatedProcedure
  .input(
    z.object({
      credentialsId: z.string(),
      typebotId: z.string(),
      groupContent: z.string(),
    }),
  )
  .output(z.object({ title: z.string() }))
  .mutation(
    async ({
      input: { credentialsId, typebotId, groupContent },
      ctx: { user },
    }) => {
      const typebot = await prisma.typebot.findUnique({
        where: { id: typebotId },
        select: {
          name: true,
          version: true,
          groups: true,
          workspace: {
            select: {
              id: true,
              isPastDue: true,
              isSuspended: true,
              settings: true,
              members: {
                select: {
                  userId: true,
                  role: true,
                },
              },
            },
          },
          collaborators: {
            select: {
              userId: true,
              type: true,
            },
          },
        },
      });

      if (!typebot || (await isWriteTypebotForbidden(typebot, user)))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Typebot not found",
        });

      const groupTitlesAutoGeneration = workspaceSchema.shape.settings.parse(
        typebot.workspace.settings,
      )?.groupTitlesAutoGeneration;

      if (
        !groupTitlesAutoGeneration?.isEnabled ||
        !groupTitlesAutoGeneration?.provider ||
        !groupTitlesAutoGeneration?.credentialsId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Group title auto-generation is not enabled",
        });
      }

      const credentials = await getCredentials(
        credentialsId,
        typebot.workspace.id,
      );

      if (!credentials)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credentials not found",
        });

      const credentialsData = await decrypt(credentials.data, credentials.iv);
      const apiKey = (credentialsData as { apiKey: string }).apiKey;

      const {
        object: { title },
      } = await generateObject({
        model: parseSmallModel({
          apiKey,
          provider: groupTitlesAutoGeneration.provider,
        }),
        schema: z.object({
          title: z.string(),
        }),
        prompt: `You will be given a group of blocks in <group>. This group is part of a chatbot scenario titled "${typebot.name}". Generate a short and concise title for that group. For example: "Introduction", "Menu", "Goodbye", "Collect name".
        <group>
        ${groupContent}
        </group>
        `,
      });

      return {
        title,
      };
    },
  );

const parseSmallModel = ({
  provider,
  apiKey,
}: {
  provider: (typeof aiProviders)[number];
  apiKey: string;
}) => {
  switch (provider) {
    case "mistral": {
      return createMistral({
        apiKey,
      })("mistral-small-latest");
    }
    case "anthropic": {
      return createAnthropic({
        apiKey,
      })("claude-3-haiku-20240307");
    }
    case "openai": {
      return createOpenAI({
        apiKey,
        compatibility: "strict",
      })("gpt-4o-mini");
    }
    case "groq":
    case "open-router":
    case "together-ai": {
      return createOpenAI({
        apiKey,
        compatibility: "compatible",
      })("gpt-4o-mini");
    }
  }
};
