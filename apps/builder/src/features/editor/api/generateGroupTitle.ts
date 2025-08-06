import { isWriteTypebotForbidden } from "@/features/typebot/helpers/isWriteTypebotForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import prisma from "@typebot.io/prisma";
import { defaultGroupTitleGenPrompt } from "@typebot.io/user/constants";
import { groupTitlesAutoGenerationSchema } from "@typebot.io/user/schemas";
import { z } from "@typebot.io/zod";
import { generateObject } from "ai";

export const generateGroupTitle = authenticatedProcedure
  .input(
    z.object({
      credentialsId: z.string(),
      typebotId: z.string(),
      groupContent: z.string(),
      model: z.string(),
      prompt: z.string().optional(),
    }),
  )
  .output(z.object({ title: z.string() }))
  .mutation(
    async ({
      input: { credentialsId, typebotId, groupContent, model, prompt },
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

      const groupTitlesAutoGeneration = groupTitlesAutoGenerationSchema.parse(
        user.groupTitlesAutoGeneration,
      );
      if (
        !groupTitlesAutoGeneration.isEnabled ||
        !groupTitlesAutoGeneration.provider ||
        !groupTitlesAutoGeneration.credentialsId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Group title auto-generation is not enabled",
        });
      }

      const credentials = await prisma.userCredentials.findUnique({
        where: {
          id: credentialsId,
          userId: user.id,
        },
        select: {
          data: true,
          iv: true,
        },
      });

      if (!credentials)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credentials not found",
        });

      const credentialsData = await decrypt(credentials.data, credentials.iv);
      const apiKey = (credentialsData as { apiKey: string }).apiKey;

      const blockDef =
        forgedBlocks[
          groupTitlesAutoGeneration.provider as unknown as keyof typeof forgedBlocks
        ];
      if (!blockDef)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provider not found",
        });
      const action = blockDef.actions.find((a) => a.aiGenerate);
      if (!action)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provider does not support AI generate",
        });
      const aiModel = action?.aiGenerate?.getModel?.({
        credentials: {
          apiKey,
        } as any,
        model,
      });
      if (!aiModel)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Model not found",
        });
      const {
        object: { title },
      } = await generateObject({
        model: aiModel,
        schema: z.object({
          title: z.string(),
        }),
        prompt: (prompt ?? defaultGroupTitleGenPrompt)
          .replace("[[typebotName]]", typebot.name)
          .replace("[[groupContent]]", groupContent),
      });

      return {
        title,
      };
    },
  );
