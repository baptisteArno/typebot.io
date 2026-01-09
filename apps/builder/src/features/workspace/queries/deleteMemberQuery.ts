import { orpcClient } from "@/lib/queryClient";

export const deleteMemberQuery = (workspaceId: string, userId: string) =>
  orpcClient.workspace.deleteWorkspaceMember({
    input: { workspaceId, memberId: userId },
  });
