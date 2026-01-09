import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";

export const listWorkspaces = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/workspaces",
      protect: true,
      summary: "List workspaces",
      tags: ["Workspace"],
    },
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        workspaceSchema.pick({ id: true, name: true, icon: true, plan: true }),
      ),
    }),
  )
  .handler(async ({ context: { user } }) => {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { name: true, id: true, icon: true, plan: true },
    });

    if (!workspaces)
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    return { workspaces };
  });
