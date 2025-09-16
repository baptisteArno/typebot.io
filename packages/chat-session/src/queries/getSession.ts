import * as Sentry from "@sentry/nextjs";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { sessionStateSchema } from "../schemas";

export const getSession = async (sessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, updatedAt: true, isReplying: true },
  });
  if (!session) return null;
  const parsedState = z
    .preprocess((val) => {
      // Retrocompatibility with old sessions
      if (val && typeof val === "object" && Object.keys(val).length === 0)
        return null;
      return val;
    }, sessionStateSchema.nullable())
    .parse(session.state);
  Sentry.setUser({ id: parsedState?.typebotsQueue[0].typebot.id });
  return {
    ...session,
    state: parsedState,
  };
};
