import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const updateWorkspaceMemberInputSchema = z.object({
  workspaceId: z.string(),
  memberId: z.string(),
  role: z.nativeEnum(WorkspaceRole),
});

export const handleUpdateWorkspaceMember = async ({
  input: { workspaceId, memberId, role },
  context: { user },
}: {
  input: z.infer<typeof updateWorkspaceMemberInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const member = await prisma.memberInWorkspace.updateMany({
    where: {
      userId: memberId,
      workspace: {
        id: workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    },
    data: { role },
  });
  return { member };
};
