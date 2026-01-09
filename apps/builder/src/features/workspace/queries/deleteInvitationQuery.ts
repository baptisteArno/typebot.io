import { orpcClient } from "@/lib/queryClient";

export const deleteInvitationQuery = (invitation: {
  workspaceId: string;
  id: string;
}) =>
  orpcClient.workspace.deleteWorkspaceInvitation({
    input: { id: invitation.id },
  });
