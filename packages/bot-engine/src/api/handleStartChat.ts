import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { messageSchema } from "@typebot.io/chat-api/schemas";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { z } from "@typebot.io/zod";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { assertOriginIsAllowed } from "../helpers/assertOriginIsAllowed";
import { filterPotentiallySensitiveLogs } from "../logs/filterPotentiallySensitiveLogs";
import { saveStateToDatabase } from "../saveStateToDatabase";
import { startSession } from "../startSession";

export const startChatInputSchema = z.object({
  publicId: z
    .string()
    .describe(
      "[Where to find my bot's public ID?](../how-to#how-to-find-my-publicid)",
    ),
  resultId: z
    .string()
    .optional()
    .describe("Provide it if you'd like to overwrite an existing result."),
  message: messageSchema
    .optional()
    .describe(
      "Only provide it if your flow starts with an input block and you'd like to directly provide an answer to it.",
    ),
  isStreamEnabled: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "If enabled, you will be required to stream OpenAI completions on a client and send the generated response back to the API.",
    ),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "If set to `true`, it will only register the session and not start the bot. This is used for 3rd party chat platforms as it can require a session to be registered before sending the first message.",
    ),
  prefilledVariables: z
    .record(z.unknown())
    .optional()
    .describe(
      "[More info about prefilled variables.](../../editor/variables#prefilled-variables)",
    )
    .openapi({
      example: {
        "First name": "John",
        Email: "john@gmail.com",
      },
    }),
  textBubbleContentFormat: z.enum(["richText", "markdown"]).default("richText"),
});

type Context = {
  origin?: string;
  iframeReferrerOrigin?: string;
};

export const handleStartChat = async ({
  input: {
    message,
    isOnlyRegistering,
    publicId,
    isStreamEnabled,
    prefilledVariables,
    resultId: startResultId,
    textBubbleContentFormat,
  },
  context: { origin, iframeReferrerOrigin },
}: {
  input: z.infer<typeof startChatInputSchema>;
  context: Context;
}) => {
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
