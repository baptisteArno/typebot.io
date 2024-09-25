import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { forgedBlockIds } from "@typebot.io/forge-repository/constants";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getFetchers } from "../helpers/getFetchers";

export const fetchSelectItems = authenticatedProcedure
  .input(
    z.object({
      integrationId: z.enum(forgedBlockIds),
      fetcherId: z.string(),
      options: z.any(),
      workspaceId: z.string(),
    }),
  )
  .query(
    async ({
      input: { workspaceId, integrationId, fetcherId, options },
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
          credentials: options.credentialsId
            ? {
                where: {
                  id: options.credentialsId,
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

      const credentials = workspace.credentials?.at(0);

      const credentialsData = credentials
        ? await decrypt(credentials.data, credentials.iv)
        : undefined;

      const blockDef = forgedBlocks[integrationId];

      const fetcher = getFetchers(blockDef).find(
        (fetcher) => fetcher.id === fetcherId,
      );

      if (!fetcher) return { items: [] };

      return {
        items: await fetcher.fetch({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          credentials: credentialsData as any,
          options,
        }),
      };
    },
  );
