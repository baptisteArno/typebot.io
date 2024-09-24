import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { continueBotFlow } from "../continueBotFlow";
import { filterPotentiallySensitiveLogs } from "../logs/filterPotentiallySensitiveLogs";
import { parseDynamicTheme } from "../parseDynamicTheme";
import { getSession } from "../queries/getSession";
import { saveStateToDatabase } from "../saveStateToDatabase";
import type { Message } from "../schemas/api";

type Props = {
  origin: string | undefined;
  message?: Message;
  sessionId: string;
  textBubbleContentFormat: "richText" | "markdown";
};
export const continueChat = async ({
  origin,
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

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

  if (isSessionExpired)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session expired. You need to start a new session.",
    });

  let corsOrigin;

  if (
    session?.state.allowedOrigins &&
    session.state.allowedOrigins.length > 0
  ) {
    if (origin && session.state.allowedOrigins.includes(origin))
      corsOrigin = origin;
    else corsOrigin = session.state.allowedOrigins[0];
  }

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
    startTime: Date.now(),
    textBubbleContentFormat,
  });

  if (newSessionState)
    await saveStateToDatabase({
      session: {
        id: session.id,
        state: newSessionState,
      },
      input,
      logs,
      clientSideActions,
      visitedEdges,
      setVariableHistory,
      hasEmbedBubbleWithWaitEvent: messages.some(
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
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: isPreview ? logs : logs?.filter(filterPotentiallySensitiveLogs),
    lastMessageNewFormat,
    corsOrigin,
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
