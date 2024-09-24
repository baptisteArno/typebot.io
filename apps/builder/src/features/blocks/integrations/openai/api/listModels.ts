import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";
import type { OpenAICredentials } from "@typebot.io/blocks-integrations/openai/schema";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { type ClientOptions, OpenAI } from "openai";

export const listModels = authenticatedProcedure
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
      baseUrl: z.string(),
      apiVersion: z.string().optional(),
      type: z.enum(["gpt", "tts"]),
    }),
  )
  .query(
    async ({
      input: { credentialsId, workspaceId, baseUrl, apiVersion, type },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findFirst({
        where: { id: workspaceId },
        select: {
          members: {
            select: {
              userId: true,
            },
          },
          credentials: {
            where: {
              id: credentialsId,
            },
            select: {
              id: true,
              data: true,
              iv: true,
            },
          },
        },
      });

      if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workspace found",
        });

      const credentials = workspace.credentials.at(0);

      if (!credentials)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No credentials found",
        });

      const data = (await decrypt(
        credentials.data,
        credentials.iv,
      )) as OpenAICredentials["data"];

      const config = {
        apiKey: data.apiKey,
        baseURL: baseUrl ?? defaultOpenAIOptions.baseUrl,
        defaultHeaders: {
          "api-key": data.apiKey,
        },
        defaultQuery: isNotEmpty(apiVersion)
          ? {
              "api-version": apiVersion,
            }
          : undefined,
      } satisfies ClientOptions;

      const openai = new OpenAI(config);

      const models = await openai.models.list();

      return {
        models:
          models.data
            .filter((model) => model.id.includes(type))
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? [],
      };
    },
  );
