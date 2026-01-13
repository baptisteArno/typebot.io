import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";

export const handleListWorkspaces = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id"> };
}) => {
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { name: true, id: true, icon: true, plan: true },
  });

  if (!workspaces)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  return { workspaces };
};
