import * as Sentry from "@sentry/nextjs";
import prisma from "@typebot.io/prisma";
import { sessionStateSchema } from "../schemas";
import { deleteSession } from "./deleteSession";

export const getSession = async (sessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, updatedAt: true, isReplying: true },
  });
  if (!session?.state) return null;
  if (Object.keys(session.state).length === 0) {
    await deleteSession(session.id);
    return null;
  }
  const parsedState = sessionStateSchema.parse(session.state);
  Sentry.setUser({ id: parsedState.typebotsQueue[0].typebot.id });
  return {
    ...session,
    state: parsedState,
  };
};
