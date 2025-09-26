import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { deleteSession } from "@typebot.io/chat-session/queries/deleteSession";
import { updateSession } from "@typebot.io/chat-session/queries/updateSession";
import { upsertSession } from "@typebot.io/chat-session/queries/upsertSession";
import type { ChatSession } from "@typebot.io/chat-session/schemas";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { upsertResult } from "./queries/upsertResult";

type Props = {
  session: Pick<ChatSession, "state"> & { id?: string };
  input: ContinueChatResponse["input"];
  logs: ContinueChatResponse["logs"];
  clientSideActions: ContinueChatResponse["clientSideActions"];
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
  isWaitingForExternalEvent?: boolean;
  initialSessionId?: string;
  sessionId: {
    type: "existing" | "new";
    id: string;
  };
};

export const saveStateToDatabase = async ({
  sessionId,
  session: { state },
  input,
  logs,
  clientSideActions,
  visitedEdges,
  setVariableHistory,
  isWaitingForExternalEvent,
}: Props) => {
  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => action.expectsDedicatedReply,
  );

  const isCompleted = Boolean(
    !input &&
      !containsSetVariableClientSideAction &&
      !isWaitingForExternalEvent,
  );

  const queries: Prisma.PrismaPromise<any>[] = [];

  const resultId = state.typebotsQueue[0].resultId;

  if (sessionId.type === "existing") {
    if (isCompleted && resultId) queries.push(deleteSession(sessionId.id));
    else
      queries.push(
        updateSession({
          id: sessionId.id,
          state,
          isReplying: isWaitingForExternalEvent ?? false,
        }),
      );
  }

  const session =
    sessionId.type === "existing"
      ? { state, id: sessionId.id }
      : await upsertSession(sessionId.id, {
          state,
          isReplying: isWaitingForExternalEvent ?? false,
        });

  if (!resultId) {
    if (queries.length > 0) await prisma.$transaction(queries);
    return session;
  }

  const answers = state.typebotsQueue[0].answers;

  queries.push(
    upsertResult({
      resultId,
      typebot: state.typebotsQueue[0].typebot,
      isCompleted: Boolean(
        !input && !containsSetVariableClientSideAction && answers.length > 0,
      ),
      hasStarted: answers.length > 0,
      lastChatSessionId: session.id,
      logs,
      visitedEdges,
      setVariableHistory,
    }),
  );

  await prisma.$transaction(queries);

  return session;
};
