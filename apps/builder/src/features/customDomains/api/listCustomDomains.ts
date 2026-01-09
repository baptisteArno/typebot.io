import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { customDomainSchema } from "@typebot.io/schemas/features/customDomains";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const listCustomDomains = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/custom-domains",
      protect: true,
      summary: "List custom domains",
      tags: ["Custom domains"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    }),
  )
  .output(
    z.object({
      customDomains: z.array(
        customDomainSchema.pick({
          name: true,
          createdAt: true,
        }),
      ),
    }),
  )
  .handler(async ({ input: { workspaceId }, context: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
          },
        },
        customDomains: true,
      },
    });

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    const descSortedCustomDomains = workspace.customDomains.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return { customDomains: descSortedCustomDomains };
  });
