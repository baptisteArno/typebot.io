import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

export const listMembersInWorkspaceInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
});

export const handleListMembersInWorkspace = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: z.infer<typeof listMembersInWorkspaceInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  return {
    members: workspace.members.map((member) => ({
      role: member.role,
      userId: member.userId,
      user: member.user,
      workspaceId,
    })),
  };
};
