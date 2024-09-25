import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { workspaceMemberSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

export const listMembersInWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/workspaces/{workspaceId}/members",
      protect: true,
      summary: "List members in workspace",
      tags: ["Workspace"],
    },
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
      members: z.array(workspaceMemberSchema),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No workspaces found",
      });

    return {
      members: workspace.members.map((member) => ({
        role: member.role,
        user: member.user,
        workspaceId,
      })),
    };
  });
