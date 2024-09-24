import { env } from "@typebot.io/env";
import type { Prisma } from "@typebot.io/prisma/types";
import { settingsSchema } from "@typebot.io/settings/schemas";
import type { Workspace } from "@typebot.io/workspaces/schemas";

export const isReadTypebotForbidden = async (
  typebot: {
    settings?: Prisma.Typebot["settings"];
    collaborators: Pick<Prisma.CollaboratorsOnTypebots, "userId">[];
  } & {
    workspace: Pick<Workspace, "isSuspended" | "isPastDue"> & {
      members: Pick<Prisma.MemberInWorkspace, "userId">[];
    };
  },
  user?: Pick<Prisma.User, "email" | "id">,
) => {
  const settings = typebot.settings
    ? settingsSchema.parse(typebot.settings)
    : undefined;
  const isTypebotPublic = settings?.publicShare?.isEnabled === true;
  if (isTypebotPublic) return false;
  return (
    !user ||
    typebot.workspace.isSuspended ||
    typebot.workspace.isPastDue ||
    (env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
      !typebot.collaborators.some(
        (collaborator) => collaborator.userId === user.id,
      ) &&
      !typebot.workspace.members.some((member) => member.userId === user.id))
  );
};
