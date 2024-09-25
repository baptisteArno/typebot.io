import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import ky, { HTTPError } from "ky";

export const deleteCustomDomain = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/custom-domains/{name}",
      protect: true,
      summary: "Delete custom domain",
      tags: ["Custom domains"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      name: z.string(),
    }),
  )
  .output(
    z.object({
      message: z.literal("success"),
    }),
  )
  .mutation(async ({ input: { workspaceId, name }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No workspaces found",
      });

    try {
      await deleteDomainOnVercel(name);
    } catch (error) {
      console.error(error);
      if (error instanceof HTTPError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete domain on Vercel",
          cause: await error.response.text(),
        });
      else
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete domain on Vercel",
        });
    }
    await prisma.customDomain.deleteMany({
      where: {
        name,
        workspaceId,
      },
    });

    return { message: "success" };
  });

const deleteDomainOnVercel = (name: string) =>
  ky.delete(
    `https://api.vercel.com/v9/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${name}?teamId=${env.VERCEL_TEAM_ID}`,
    {
      headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    },
  );
