import type { Prisma } from "@typebot.io/prisma/types";
import { orpcClient } from "@/lib/queryClient";

export const updateMemberQuery = (
  workspaceId: string,
  member: Partial<Prisma.MemberInWorkspace>,
) =>
  orpcClient.workspace.updateWorkspaceMember({
    input: {
      workspaceId,
      memberId: member.userId!,
      role: member.role!,
    },
  });
