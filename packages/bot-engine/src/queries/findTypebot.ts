import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

type Props = {
  id: string;
  userId: string;
};

export const findTypebot = ({ id, userId }: Props) =>
  prisma.typebot.findFirst({
    where: {
      id,
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
    select: {
      version: true,
      id: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      isArchived: true,
      updatedAt: true,
      workspaceId: true,
    },
  });
