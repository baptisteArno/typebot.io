import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const updateInvitationQuery = (
  typebotId: string,
  email: string,
  invitation: Omit<Prisma.Invitation, "createdAt" | "id" | "updatedAt">,
) =>
  sendRequest({
    method: "PATCH",
    url: `/api/typebots/${typebotId}/invitations/${email}`,
    body: invitation,
  });
