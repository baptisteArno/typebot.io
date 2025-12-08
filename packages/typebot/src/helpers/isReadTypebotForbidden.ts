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
  if (!user) return true;
  if ((env.ADMIN_EMAIL ?? []).some((email) => email === user.email))
    return false;
  return (
    typebot.workspace.isSuspended ||
    typebot.workspace.isPastDue ||
    (!typebot.collaborators.some(
      (collaborator) => collaborator.userId === user.id,
    ) &&
      !typebot.workspace.members.some((member) => member.userId === user.id))
  );
};
