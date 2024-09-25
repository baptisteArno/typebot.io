import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionState } from "../schemas/chatSession";

type Props = {
  id: string;
  state: SessionState;
  isReplying: boolean | undefined;
};

export const updateSession = ({
  id,
  state,
  isReplying,
}: Props): Prisma.PrismaPromise<any> =>
  prisma.chatSession.updateMany({
    where: { id },
    data: {
      state,
      isReplying,
    },
  });
