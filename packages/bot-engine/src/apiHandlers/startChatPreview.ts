import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type {
  Message,
  StartFrom,
  StartTypebot,
} from "@typebot.io/chat-api/schemas";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { saveStateToDatabase } from "../saveStateToDatabase";
import { startSession } from "../startSession";

type Props = {
  message?: Message;
  isOnlyRegistering: boolean;
  isStreamEnabled: boolean;
  startFrom?: StartFrom;
  typebotId: string;
  typebot?: StartTypebot;
  userId?: string;
  prefilledVariables?: Record<string, unknown>;
  sessionId?: string;
  textBubbleContentFormat: "richText" | "markdown";
};

export const startChatPreview = async ({
  message,
  isOnlyRegistering,
  isStreamEnabled,
  startFrom,
  typebotId,
  typebot: startTypebot,
  userId,
  prefilledVariables,
  sessionId: sessionIdProp,
  textBubbleContentFormat,
}: Props) => {
  const sessionId = sessionIdProp ?? createId();
  const sessionStore = getSessionStore(sessionId);
  const {
    typebot,
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
    setVariableHistory,
  } = await startSession({
    version: 2,
    sessionStore,
    startParams: {
      type: "preview",
      isOnlyRegistering,
      isStreamEnabled,
      startFrom,
      typebotId,
      typebot: startTypebot,
      userId,
      prefilledVariables,
      textBubbleContentFormat,
      message,
    },
  });
  deleteSessionStore(sessionId);

  const session = isOnlyRegistering
    ? await restartSession({
        state: newSessionState,
      })
    : await saveStateToDatabase({
        session: {
          state: newSessionState,
        },
        sessionId: {
          type: "new",
          id: sessionId,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
        setVariableHistory,
        isWaitingForExternalEvent: messages.some(
          (message) =>
            message.type === "custom-embed" ||
            (message.type === BubbleBlockType.EMBED &&
              message.content.waitForEvent?.isEnabled),
        ),
      });

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0;

  return {
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      version: typebot.version,
      theme: typebot.theme,
      settings: typebot.settings,
    },
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    progress: newSessionState.progressMetadata
      ? isEnded
        ? 100
        : computeCurrentProgress({
            typebotsQueue: newSessionState.typebotsQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  };
};
