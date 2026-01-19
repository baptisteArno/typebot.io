import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const deleteWorkspaceMemberInputSchema = z.object({
  workspaceId: z.string(),
  memberId: z.string(),
});

export const handleDeleteWorkspaceMember = async ({
  input: { workspaceId, memberId },
  context: { user },
}: {
  input: z.infer<typeof deleteWorkspaceMemberInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const member = await prisma.memberInWorkspace.deleteMany({
    where: {
      userId: memberId,
      workspace: {
        id: workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    },
  });
  return { member };
};
