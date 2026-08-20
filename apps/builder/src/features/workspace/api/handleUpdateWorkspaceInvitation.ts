import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const updateWorkspaceInvitationInputSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  type: z.nativeEnum(WorkspaceRole).optional(),
});

export const handleUpdateWorkspaceInvitation = async ({
  input: { id, email, type },
  context: { user },
}: {
  input: z.infer<typeof updateWorkspaceInvitationInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const invitation = await prisma.workspaceInvitation.updateMany({
    where: {
      id,
      workspace: {
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    },
    data: {
      ...(email === undefined ? {} : { email }),
      ...(type === undefined ? {} : { type }),
    },
  });
  return { invitation };
};
