import { sendRequest } from "@typebot.io/lib/utils";

export const deleteCollaboratorQuery = (typebotId: string, userId: string) =>
  sendRequest({
    method: "DELETE",
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
  });
