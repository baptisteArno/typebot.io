import type { Prisma } from "@typebot.io/prisma/types";
import { orpcClient } from "@/lib/queryClient";

export const updateInvitationQuery = (
  invitation: Partial<Prisma.WorkspaceInvitation>,
) =>
  orpcClient.workspace.updateWorkspaceInvitation({
    input: {
      id: invitation.id!,
      email: invitation.email,
      type: invitation.type,
      workspaceId: invitation.workspaceId,
    },
  });
