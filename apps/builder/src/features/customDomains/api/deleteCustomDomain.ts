import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { HTTPError } from "ky";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteCustomDomain = authenticatedProcedure
  .route({
    method: "DELETE",
    path: "/v1/custom-domains/{name}",
    summary: "Delete custom domain",
    tags: ["Custom domains"],
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
  .handler(async ({ input: { workspaceId, name }, context: { user } }) => {
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
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    try {
      await deleteDomainOnVercel(name);
    } catch (error) {
      console.error(error);
      if (error instanceof HTTPError)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete domain on Vercel",
          cause: await error.response.text(),
        });
      else
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
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
