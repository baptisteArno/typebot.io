import prisma from "@typebot.io/prisma";
import {
  type PublicTypebot,
  publicTypebotSchema,
} from "@typebot.io/typebot/schemas/publicTypebot";
import {
  type Typebot,
  typebotSchema,
} from "@typebot.io/typebot/schemas/typebot";

type Props = {
  isPreview?: boolean;
  typebotIds: string[];
  userId: string | undefined;
};

export const fetchLinkedTypebots = async ({
  userId,
  isPreview,
  typebotIds,
}: Props): Promise<(Typebot | PublicTypebot)[]> => {
  if (!userId || !isPreview) {
    const publicTypebots = await prisma.publicTypebot.findMany({
      where: { typebotId: { in: typebotIds } },
    });
    return publicTypebots.map((typebot) => publicTypebotSchema.parse(typebot));
  }
  const linkedTypebots = await prisma.typebot.findMany({
    where: { id: { in: typebotIds } },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
      workspace: {
        select: {
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  return linkedTypebots
    .filter(
      (typebot) =>
        typebot.collaborators.some(
          (collaborator) => collaborator.userId === userId,
        ) ||
        typebot.workspace.members.some((member) => member.userId === userId),
    )
    .map((typebot) => typebotSchema.parse(typebot));
};
