import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { continueBotFlow } from "../continueBotFlow";
import { assertOriginIsAllowed } from "../helpers/isOriginAllowed";
import { filterPotentiallySensitiveLogs } from "../logs/filterPotentiallySensitiveLogs";
import { parseDynamicTheme } from "../parseDynamicTheme";
import { saveStateToDatabase } from "../saveStateToDatabase";
import type { Message } from "../schemas/api";

type Props = {
  origin: string | undefined;
  iframeReferrerOrigin: string | undefined;
  message?: Message;
  sessionId: string;
  textBubbleContentFormat: "richText" | "markdown";
};
export const continueChat = async ({
  origin,
  iframeReferrerOrigin,
  sessionId,
  message,
  textBubbleContentFormat,
}: Props) => {
  const session = await getSession(sessionId);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session not found.",
    });
  }

  assertOriginIsAllowed(origin, {
    allowedOrigins: session.state.allowedOrigins,
    iframeReferrerOrigin,
  });

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

  if (isSessionExpired)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session expired. You need to start a new session.",
    });

  const sessionStore = getSessionStore(sessionId);
  const {
    messages,
    input,
    clientSideActions,
    newSessionState,
    logs,
    lastMessageNewFormat,
    visitedEdges,
    setVariableHistory,
  } = await continueBotFlow(message, {
    version: 2,
    state: session.state,
    textBubbleContentFormat,
    sessionStore,
  });
  const dynamicTheme = parseDynamicTheme({
    state: newSessionState,
    sessionStore,
  });
  deleteSessionStore(sessionId);

  if (newSessionState)
    await saveStateToDatabase({
      sessionId: {
        type: "existing",
        id: session.id,
      },
      session: {
        state: newSessionState,
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

  const isPreview = isNotDefined(session.state.typebotsQueue[0].resultId);

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0;

  return {
    messages,
    input,
    clientSideActions,
    dynamicTheme,
    logs: isPreview ? logs : logs?.filter(filterPotentiallySensitiveLogs),
    lastMessageNewFormat,
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
