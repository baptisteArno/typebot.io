import { ORPCError } from "@orpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import { isDefined } from "@typebot.io/lib/utils";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import type { z } from "@typebot.io/zod";
import { continueBotFlow } from "../../continueBotFlow";
import { assertOriginIsAllowed } from "../../helpers/assertOriginIsAllowed";
import { parseDynamicTheme } from "../../parseDynamicTheme";
import { saveStateToDatabase } from "../../saveStateToDatabase";
import type { sendMessageInputSchema } from "../../schemas/legacy/schema";
import { startSession } from "../../startSession";

type Context = {
  user?: { id: string };
  origin?: string;
  iframeReferrerOrigin?: string;
};

export const handleSendMessageV1 = async ({
  input: { sessionId, message, startParams, clientLogs },
  context: { user, origin, iframeReferrerOrigin },
}: {
  input: z.infer<typeof sendMessageInputSchema>;
  context: Context;
}) => {
  const session = sessionId ? await getSession(sessionId) : null;
  const newSessionId = sessionId ?? createId();

  const isSessionExpired =
    session?.state &&
    isDefined(session.state.expiryTimeout) &&
    session.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

  if (isSessionExpired)
    throw new ORPCError("NOT_FOUND", {
      message: "Session expired. You need to start a new session.",
    });

  const sessionStore = getSessionStore(newSessionId);
  if (!session?.state) {
    if (!startParams)
      throw new ORPCError("BAD_REQUEST", {
        message: "Missing startParams",
      });
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
      sessionStore,
      version: 1,
      startParams:
        startParams.isPreview || typeof startParams.typebot !== "string"
          ? {
              type: "preview",
              isOnlyRegistering: startParams.isOnlyRegistering ?? false,
              isStreamEnabled: startParams.isStreamEnabled ?? false,
              startFrom:
                "startGroupId" in startParams && startParams.startGroupId
                  ? {
                      type: "group",
                      groupId: startParams.startGroupId,
                    }
                  : "startEventId" in startParams && startParams.startEventId
                    ? {
                        type: "event",
                        eventId: startParams.startEventId,
                      }
                    : undefined,
              typebotId:
                typeof startParams.typebot === "string"
                  ? startParams.typebot
                  : startParams.typebot.id,
              typebot:
                typeof startParams.typebot === "string"
                  ? undefined
                  : startParams.typebot,
              message: message ? { type: "text", text: message } : undefined,
              userId: user?.id,
              textBubbleContentFormat: "richText",
            }
          : {
              type: "live",
              isOnlyRegistering: startParams.isOnlyRegistering ?? false,
              isStreamEnabled: startParams.isStreamEnabled ?? false,
              publicId: startParams.typebot,
              prefilledVariables: startParams.prefilledVariables,
              resultId: startParams.resultId,
              message: message ? { type: "text", text: message } : undefined,
              textBubbleContentFormat: "richText",
            },
    });

    if (startParams.isPreview || typeof startParams.typebot !== "string") {
      assertOriginIsAllowed(origin, {
        allowedOrigins: newSessionState.allowedOrigins,
        iframeReferrerOrigin,
      });
    }

    const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs;

    const savedSession = startParams?.isOnlyRegistering
      ? await restartSession({
          state: newSessionState,
        })
      : await saveStateToDatabase({
          sessionId: {
            type: "new",
            id: newSessionId,
          },
          session: {
            state: newSessionState,
          },
          input,
          logs: allLogs,
          clientSideActions,
          visitedEdges,
          isWaitingForExternalEvent: messages.some(
            (message) =>
              message.type === "custom-embed" ||
              (message.type === BubbleBlockType.EMBED &&
                message.content.waitForEvent?.isEnabled),
          ),
          setVariableHistory,
        });

    deleteSessionStore(newSessionId);

    return {
      sessionId: savedSession.id,
      typebot: typebot
        ? {
            id: typebot.id,
            theme: typebot.theme,
            settings: typebot.settings,
          }
        : undefined,
      messages,
      input,
      resultId,
      dynamicTheme,
      logs,
      clientSideActions,
    };
  } else {
    assertOriginIsAllowed(origin, {
      allowedOrigins: session.state.allowedOrigins,
      iframeReferrerOrigin,
    });

    const {
      messages,
      input,
      clientSideActions,
      newSessionState,
      logs,
      lastMessageNewFormat,
      visitedEdges,
      setVariableHistory,
    } = await continueBotFlow(
      message ? { type: "text", text: message } : undefined,
      {
        version: 1,
        state: session.state,
        textBubbleContentFormat: "richText",
        sessionStore,
      },
    );

    const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs;

    if (newSessionState)
      await saveStateToDatabase({
        sessionId: {
          type: "existing",
          id: newSessionId,
        },
        session: {
          state: newSessionState,
        },
        input,
        logs: allLogs,
        clientSideActions,
        visitedEdges,
        isWaitingForExternalEvent: messages.some(
          (message) =>
            message.type === "custom-embed" ||
            (message.type === BubbleBlockType.EMBED &&
              message.content.waitForEvent?.isEnabled),
        ),
        setVariableHistory,
      });

    const dynamicTheme = parseDynamicTheme({
      state: newSessionState,
      sessionStore,
    });
    deleteSessionStore(newSessionId);

    return {
      messages,
      input,
      clientSideActions,
      dynamicTheme,
      logs,
      lastMessageNewFormat,
    };
  }
};
