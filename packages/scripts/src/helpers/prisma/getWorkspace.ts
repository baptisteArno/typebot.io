import prisma from "@typebot.io/prisma";

export async function getPrismaWorkspace(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      stripeId: true,
      createdAt: true,
      plan: true,
      members: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      typebots: {
        select: {
          version: true,
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          groups: true,
        },
      },
    },
  });

  return workspace;
}
