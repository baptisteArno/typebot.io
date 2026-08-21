import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";

export const handleListTypebots = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id"> };
}) => {
  const typebots = await prisma.typebot.findMany({
    where: {
      OR: [
        {
          workspace: {
            members: {
              some: {
                userId: user.id,
                role: { not: WorkspaceRole.GUEST },
              },
            },
          },
        },
        { collaborators: { some: { userId: user.id } } },
      ],
      isArchived: { not: true },
    },
    select: {
      name: true,
      publishedTypebot: { select: { id: true } },
      id: true,
    },
  });

  return {
    typebots: typebots.map((typebot) => ({
      id: typebot.id,
      name: typebot.name,
      publishedTypebotId: typebot.publishedTypebot?.id,
    })),
  };
};
