import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { Member } from "../types";

export const sendInvitationQuery = (
  invitation: Omit<
    Prisma.WorkspaceInvitation,
    "id" | "createdAt" | "updatedAt"
  >,
) =>
  sendRequest<{ invitation?: Prisma.WorkspaceInvitation; member?: Member }>({
    url: `/api/workspaces/${invitation.workspaceId}/invitations`,
    method: "POST",
    body: invitation,
  });
