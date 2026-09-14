import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

type Props = {
  isPreview?: boolean;
  typebotIds: string[];
  userId: string | undefined;
};

export const fetchLinkedTypebots = async ({
  userId,
  isPreview,
  typebotIds,
}: Props) => {
  if (!isPreview)
    return prisma.publicTypebot.findMany({
      where: { typebotId: { in: typebotIds } },
    });
  if (!userId) return [];
  return prisma.typebot.findMany({
    where: {
      id: { in: typebotIds },
      OR: [
        {
          workspace: {
            members: {
              some: { userId, role: { not: WorkspaceRole.GUEST } },
            },
          },
        },
        { collaborators: { some: { userId } } },
      ],
    },
  });
};
