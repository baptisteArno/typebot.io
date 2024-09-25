import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const updateInvitationQuery = (
  invitation: Partial<Prisma.WorkspaceInvitation>,
) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: "PATCH",
    body: invitation,
  });
