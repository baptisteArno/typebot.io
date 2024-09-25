import { sendRequest } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

export const updateMemberQuery = (
  workspaceId: string,
  member: Partial<Prisma.MemberInWorkspace>,
) =>
  sendRequest({
    method: "PATCH",
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  });
