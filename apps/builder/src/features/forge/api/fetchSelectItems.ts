import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { decryptAndRefreshCredentialsData } from "@typebot.io/credentials/decryptAndRefreshCredentials";
import type { Credentials } from "@typebot.io/credentials/schemas";
import type { FetcherHandler } from "@typebot.io/forge/types";
import { forgedBlockIds } from "@typebot.io/forge-repository/constants";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { forgedBlockHandlers } from "@typebot.io/forge-repository/handlers";
import type { ToastErrorData } from "@typebot.io/lib/toastErrorData";
import prisma from "@typebot.io/prisma";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

const baseInputSchema = z.object({
  integrationId: z.enum(forgedBlockIds),
  fetcherId: z.string(),
  options: z.any(),
});

export const fetchSelectItems = authenticatedProcedure
  .input(
    z.discriminatedUnion("scope", [
      z
        .object({
          scope: z.literal("workspace"),
          workspaceId: z.string(),
        })
        .merge(baseInputSchema),
      z
        .object({
          scope: z.literal("user"),
        })
        .merge(baseInputSchema),
    ]),
  )
  .handler(async ({ input, context: { user } }) => {
    let credentials:
      | { id: string; data: string; iv: string }
      | null
      | undefined;
    if (input.scope === "user") {
      credentials = await prisma.userCredentials.findFirst({
        where: {
          userId: user.id,
          id: input.options.credentialsId,
        },
        select: {
          id: true,
          data: true,
          iv: true,
        },
      });
    } else {
      const workspace = await prisma.workspace.findFirst({
        where: { id: input.workspaceId },
        select: {
          members: {
            select: {
              userId: true,
            },
          },
          credentials: input.options.credentialsId
            ? {
                where: {
                  id: input.options.credentialsId,
                },
                select: {
                  id: true,
                  data: true,
                  iv: true,
                },
              }
            : undefined,
        },
      });

      if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new ORPCError("NOT_FOUND", { message: "No workspace found" });

      credentials = workspace.credentials?.at(0);
    }

    const blockDef = forgedBlocks[input.integrationId];

    const credentialsData = credentials
      ? await decryptAndRefreshCredentialsData(
          {
            ...credentials,
            type: input.integrationId as Credentials["type"],
          },
          blockDef.auth && "defaultClientEnvKeys" in blockDef.auth
            ? blockDef.auth.defaultClientEnvKeys
            : undefined,
        )
      : undefined;

    const handler = forgedBlockHandlers[input.integrationId]?.find(
      (handler) => handler.type === "fetcher" && handler.id === input.fetcherId,
    ) as FetcherHandler | undefined;

    if (!handler) return { items: [] };

    const { data, error } = await handler.fetch({
      credentials: credentialsData as any,
      options: input.options,
    });

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: error.description,
        data: {
          context: error.context,
          details: error.details,
        } satisfies ToastErrorData,
      });

    return { items: data };
  });
