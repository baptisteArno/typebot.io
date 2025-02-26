import {
  removeObjectsFromUser,
  removeObjectsFromWorkspace,
} from "@typebot.io/lib/s3/removeObjectsRecursively";
import prisma from "@typebot.io/prisma/withReadReplica";

export const destroyWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      typebots: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!workspace) return;

  for (const typebot of workspace.typebots) {
    await prisma.result.deleteMany({
      where: {
        typebotId: typebot.id,
      },
    });
  }
  await prisma.workspace.delete({ where: { id: workspace.id } });
  await removeObjectsFromWorkspace(workspace.id);

  for (const member of workspace.members) {
    const user = await prisma.user.findUnique({
      where: {
        id: member.user.id,
      },
      select: {
        _count: {
          select: {
            workspaces: true,
          },
        },
      },
    });
    if ((user?._count.workspaces ?? 0) === 0) {
      await prisma.user.delete({ where: { id: member.user.id } });
      await removeObjectsFromUser(member.user.id);
    }
  }
};
