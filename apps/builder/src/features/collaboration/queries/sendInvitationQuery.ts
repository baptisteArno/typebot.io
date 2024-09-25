import { sendRequest } from "@typebot.io/lib/utils";
import type { CollaborationType } from "@typebot.io/prisma/enum";

export const sendInvitationQuery = (
  typebotId: string,
  { email, type }: { email: string; type: CollaborationType },
) =>
  sendRequest({
    method: "POST",
    url: `/api/typebots/${typebotId}/invitations`,
    body: { email, type },
  });
