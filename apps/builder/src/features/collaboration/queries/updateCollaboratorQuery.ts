import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const updateCollaboratorQuery = (
  typebotId: string,
  userId: string,
  collaborator: Omit<Prisma.CollaboratorsOnTypebots, "createdAt" | "updatedAt">,
) =>
  sendRequest({
    method: "PATCH",
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
    body: collaborator,
  });
