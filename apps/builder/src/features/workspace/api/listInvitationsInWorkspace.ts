import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { workspaceInvitationSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

export const listInvitationsInWorkspace = authenticatedProcedure
  .route({
    method: "GET",
    path: "/v1/workspaces/{workspaceId}/invitations",
    summary: "List invitations in workspace",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
    }),
  )
  .output(
    z.object({
      invitations: z.array(workspaceInvitationSchema),
    }),
  )
  .handler(async ({ input: { workspaceId }, context: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true, invitations: true },
    });

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    return { invitations: workspace.invitations };
  });
