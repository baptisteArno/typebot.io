import type { Prisma } from "@typebot.io/prisma/types";
import type { InvitationWithWorkspaceId } from "./convertInvitationsToCollaborations";

export const getNewUserInvitations = async (
  p: Prisma.PrismaClient,
  email: string,
): Promise<{
  invitations: InvitationWithWorkspaceId[];
  workspaceInvitations: Prisma.WorkspaceInvitation[];
}> => {
  const [invitations, workspaceInvitations] = await p.$transaction([
    p.invitation.findMany({
      where: { email },
      include: { typebot: { select: { workspaceId: true } } },
    }),
    p.workspaceInvitation.findMany({
      where: { email },
    }),
  ]);

  return { invitations, workspaceInvitations };
};
