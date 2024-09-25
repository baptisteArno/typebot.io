import { sendRequest } from "@typebot.io/lib/utils";

export const deleteMemberQuery = (workspaceId: string, userId: string) =>
  sendRequest({
    method: "DELETE",
    url: `/api/workspaces/${workspaceId}/members/${userId}`,
  });
