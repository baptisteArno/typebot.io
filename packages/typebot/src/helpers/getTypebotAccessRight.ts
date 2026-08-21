import { env } from "@typebot.io/env";
import { type CollaborationType, WorkspaceRole } from "@typebot.io/prisma/enum";

export const getTypebotAccessRight = (
  user: { email: string | null; id: string } | undefined | null,
  typebot: { collaborators: { userId: string; type: CollaborationType }[] } & {
    workspace: { members: { userId: string; role: WorkspaceRole }[] };
  },
): "read" | "write" | "guest" => {
  const collaborator = typebot.collaborators.find((c) => c.userId === user?.id);
  const isMemberOfWorkspace = typebot.workspace.members.some(
    (member) =>
      member.userId === user?.id && member.role !== WorkspaceRole.GUEST,
  );
  if (
    collaborator?.type === "WRITE" ||
    collaborator?.type === "FULL_ACCESS" ||
    isMemberOfWorkspace
  )
    return "write";

  if (collaborator) return "read";
  if (user?.email && env.ADMIN_EMAIL?.includes(user.email)) return "read";
  return "guest";
};
