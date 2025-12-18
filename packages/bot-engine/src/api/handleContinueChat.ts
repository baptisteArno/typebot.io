import { ORPCError } from "@orpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { messageSchema } from "@typebot.io/chat-api/schemas";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { z } from "@typebot.io/zod";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { continueBotFlow } from "../continueBotFlow";
import { assertOriginIsAllowed } from "../helpers/assertOriginIsAllowed";
import { filterPotentiallySensitiveLogs } from "../logs/filterPotentiallySensitiveLogs";
import { parseDynamicTheme } from "../parseDynamicTheme";
import { saveStateToDatabase } from "../saveStateToDatabase";

export const continueChatInputSchema = z.object({
  message: messageSchema.nullish(),
  sessionId: z
    .string()
    .describe(
      "The session ID you got from the [startChat](./start-chat) response.",
    ),
  textBubbleContentFormat: z.enum(["richText", "markdown"]).default("richText"),
});

type Context = {
  origin?: string;
  iframeReferrerOrigin?: string;
};

export const handleContinueChat = async ({
  input: { sessionId, message, textBubbleContentFormat },
  context: { origin, iframeReferrerOrigin },
}: {
  input: z.infer<typeof continueChatInputSchema>;
  context: Context;
}) => {
  const session = await getSession(sessionId);

  if (!session?.state) {
    throw new ORPCError("NOT_FOUND", {
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
    throw new ORPCError("NOT_FOUND", {
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
  } = await continueBotFlow(message ? message : undefined, {
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
