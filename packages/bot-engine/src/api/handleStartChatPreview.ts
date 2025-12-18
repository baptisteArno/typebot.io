import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  messageSchema,
  startFromSchema,
  startTypebotSchema,
} from "@typebot.io/chat-api/schemas";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { z } from "@typebot.io/zod";
import { computeCurrentProgress } from "../computeCurrentProgress";
import { saveStateToDatabase } from "../saveStateToDatabase";
import { startSession } from "../startSession";

export const startPreviewChatInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
  typebot: startTypebotSchema
    .optional()
    .describe(
      "If set, it will override the typebot that is used to start the chat.",
    ),
  sessionId: z
    .string()
    .optional()
    .describe(
      "If provided, will be used as the session ID and will overwrite any existing session with the same ID.",
    ),
  startFrom: startFromSchema.optional(),
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
  user?: { id: string };
};

export const handleStartChatPreview = async ({
  input: {
    message,
    isOnlyRegistering,
    isStreamEnabled,
    startFrom,
    typebotId,
    typebot: startTypebot,
    prefilledVariables,
    sessionId: sessionIdProp,
    textBubbleContentFormat,
  },
  context: { user },
}: {
  input: z.infer<typeof startPreviewChatInputSchema>;
  context: Context;
}) => {
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
      userId: user?.id,
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
