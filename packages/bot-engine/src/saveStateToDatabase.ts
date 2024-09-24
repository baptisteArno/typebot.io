import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { createSession } from "./queries/createSession";
import { deleteSession } from "./queries/deleteSession";
import { updateSession } from "./queries/updateSession";
import { upsertResult } from "./queries/upsertResult";
import type { ChatSession, ContinueChatResponse } from "./schemas/api";

type Props = {
  session: Pick<ChatSession, "state"> & { id?: string };
  input: ContinueChatResponse["input"];
  logs: ContinueChatResponse["logs"];
  clientSideActions: ContinueChatResponse["clientSideActions"];
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
  hasEmbedBubbleWithWaitEvent?: boolean;
  initialSessionId?: string;
};

export const saveStateToDatabase = async ({
  session: { state, id },
  input,
  logs,
  clientSideActions,
  visitedEdges,
  setVariableHistory,
  hasEmbedBubbleWithWaitEvent,
  initialSessionId,
}: Props) => {
  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => action.expectsDedicatedReply,
  );

  const isCompleted = Boolean(
    !input &&
      !containsSetVariableClientSideAction &&
      !hasEmbedBubbleWithWaitEvent,
  );

  const queries: Prisma.PrismaPromise<any>[] = [];

  const resultId = state.typebotsQueue[0].resultId;

  if (id) {
    if (isCompleted && resultId) queries.push(deleteSession(id));
    else queries.push(updateSession({ id, state, isReplying: false }));
  }

  const session = id
    ? { state, id }
    : await createSession({ id: initialSessionId, state, isReplying: false });

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
