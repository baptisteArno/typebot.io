import { env } from "@typebot.io/env";
import type { CollaborationType } from "@typebot.io/prisma/enum";

export const getTypebotAccessRight = (
  user: { email: string | null; id: string } | undefined,
  typebot: { collaborators: { userId: string; type: CollaborationType }[] } & {
    workspace: { members: { userId: string }[] };
  },
): "read" | "write" | "guest" => {
  const collaborator = typebot.collaborators.find((c) => c.userId === user?.id);
  const isMemberOfWorkspace = typebot.workspace.members.some(
    (m) => m.userId === user?.id,
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
