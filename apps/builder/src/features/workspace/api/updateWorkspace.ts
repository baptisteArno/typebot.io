import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { isAdminWriteWorkspaceForbidden } from "../helpers/isAdminWriteWorkspaceForbidden";

export const updateWorkspace = authenticatedProcedure
  .route({
    method: "PATCH",
    path: "/v1/workspaces/{workspaceId}",
    summary: "Update workspace",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
    }),
  )
  .output(
    z.object({
      workspace: workspaceSchema.pick({ name: true, icon: true }),
    }),
  )
  .handler(
    async ({ input: { workspaceId, icon, name }, context: { user } }) => {
      await prisma.workspace.updateMany({
        where: { members: { some: { userId: user.id } }, id: workspaceId },
        data: {
          name,
          icon,
        },
      });

      const workspace = await prisma.workspace.findFirst({
        where: { members: { some: { userId: user.id } }, id: workspaceId },
        include: { members: true },
      });

      if (!workspace)
        throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

      if (isAdminWriteWorkspaceForbidden(workspace, user))
        throw new ORPCError("FORBIDDEN", {
          message: "You are not allowed to update this workspace",
        });

      return {
        workspace,
      };
    },
  );
