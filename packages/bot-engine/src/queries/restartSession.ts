import prisma from "@typebot.io/prisma";
import type { SessionState } from "../schemas/chatSession";

type Props = {
  id?: string;
  state: SessionState;
};

export const restartSession = async ({ id, state }: Props) => {
  if (id) {
    await prisma.chatSession.deleteMany({
      where: {
        id,
      },
    });
  }

  return prisma.chatSession.create({
    data: {
      id,
      state,
    },
  });
};
