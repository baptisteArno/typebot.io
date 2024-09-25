import prisma from "@typebot.io/prisma";

type Props = {
  publicId: string;
};

export const findPublicTypebot = ({ publicId }: Props) =>
  prisma.publicTypebot.findFirst({
    where: { typebot: { publicId } },
    select: {
      version: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      typebotId: true,
      typebot: {
        select: {
          isArchived: true,
          isClosed: true,
          workspace: {
            select: {
              id: true,
              plan: true,
              customChatsLimit: true,
              isQuarantined: true,
              isSuspended: true,
            },
          },
        },
      },
      updatedAt: true,
    },
  });
