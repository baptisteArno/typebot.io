import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { ClientToastError } from "@/lib/ClientToastError";
import { TRPCError } from "@trpc/server";
import { decryptAndRefreshCredentialsData } from "@typebot.io/credentials/decryptAndRefreshCredentials";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlockIds } from "@typebot.io/forge-repository/constants";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getFetchers } from "../helpers/getFetchers";

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
  .query(async ({ input, ctx: { user } }) => {
    let credentials;
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workspace found",
        });

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

    const fetcher = getFetchers(blockDef).find(
      (fetcher) => fetcher.id === input.fetcherId,
    );

    if (!fetcher) return { items: [] };

    const { data, error } = await fetcher.fetch({
      credentials: credentialsData as any,
      options: input.options,
    });

    if (error) throw new ClientToastError(error);

    return { items: data };
  });
