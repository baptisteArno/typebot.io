import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { Message } from "@typebot.io/chat-api/schemas";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { assertOriginIsAllowed } from "../helpers/assertOriginIsAllowed";
import { filterPotentiallySensitiveLogs } from "../logs/filterPotentiallySensitiveLogs";
import { saveStateToDatabase } from "../saveStateToDatabase";
import { startSession } from "../startSession";

type Props = {
  origin: string | undefined;
  iframeReferrerOrigin: string | undefined;
  message?: Message;
  isOnlyRegistering: boolean;
  publicId: string;
  isStreamEnabled: boolean;
  prefilledVariables?: Record<string, unknown>;
  resultId?: string;
  textBubbleContentFormat: "richText" | "markdown";
};

export const startChat = async ({
  origin,
  iframeReferrerOrigin,
  message,
  isOnlyRegistering,
  publicId,
  isStreamEnabled,
  prefilledVariables,
  resultId: startResultId,
  textBubbleContentFormat,
}: Props) => {
  const sessionId = createId();
  const sessionStore = getSessionStore(sessionId);
  const {
    typebot,
    messages,
    input,
    resultId,
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
      type: "live",
      isOnlyRegistering,
      isStreamEnabled,
      publicId,
      prefilledVariables,
      resultId: startResultId,
      textBubbleContentFormat,
      message,
    },
  });
  deleteSessionStore(sessionId);

  assertOriginIsAllowed(origin, {
    allowedOrigins: newSessionState.allowedOrigins,
    iframeReferrerOrigin,
  });

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
      publishedAt: typebot.publishedAt,
    },
    messages,
    input,
    resultId,
    dynamicTheme,
    logs: logs?.filter(filterPotentiallySensitiveLogs),
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
