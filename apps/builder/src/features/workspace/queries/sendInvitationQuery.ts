import type { Prisma } from "@typebot.io/prisma/types";
import { orpcClient } from "@/lib/queryClient";

export const sendInvitationQuery = (
  invitation: Omit<
    Prisma.WorkspaceInvitation,
    "id" | "createdAt" | "updatedAt"
  >,
) =>
  orpcClient.workspace.createWorkspaceInvitation({
    input: {
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      type: invitation.type,
    },
  });
