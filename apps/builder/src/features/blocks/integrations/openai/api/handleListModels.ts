import { ORPCError } from "@orpc/server";
import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";
import type { OpenAICredentials } from "@typebot.io/blocks-integrations/openai/schema";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { type ClientOptions, OpenAI } from "openai";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const listModelsInputSchema = z.object({
  credentialsId: z.string(),
  workspaceId: z.string(),
  baseUrl: z.string(),
  apiVersion: z.string().optional(),
  type: z.enum(["gpt", "tts"]),
});

export const handleListModels = async ({
  input: { credentialsId, workspaceId, baseUrl, apiVersion, type },
  context: { user },
}: {
  input: z.infer<typeof listModelsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
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
    throw new ORPCError("NOT_FOUND", { message: "No workspace found" });

  const credentials = workspace.credentials.at(0);

  if (!credentials)
    throw new ORPCError("NOT_FOUND", { message: "No credentials found" });

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
};
