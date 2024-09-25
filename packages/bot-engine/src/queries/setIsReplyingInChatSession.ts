import prisma from "@typebot.io/prisma";

type Props = {
  existingSessionId: string | undefined;
  newSessionId: string;
};
export const setIsReplyingInChatSession = async ({
  existingSessionId,
  newSessionId,
}: Props) => {
  if (existingSessionId) {
    return prisma.chatSession.updateMany({
      where: { id: existingSessionId },
      data: { isReplying: true },
    });
  }
  return prisma.chatSession.createMany({
    data: { id: newSessionId, isReplying: true, state: {} },
  });
};
