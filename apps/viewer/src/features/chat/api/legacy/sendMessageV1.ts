import { publicProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { continueBotFlow } from "@typebot.io/bot-engine/continueBotFlow";
import { assertOriginIsAllowed } from "@typebot.io/bot-engine/helpers/isOriginAllowed";
import { parseDynamicTheme } from "@typebot.io/bot-engine/parseDynamicTheme";
import { saveStateToDatabase } from "@typebot.io/bot-engine/saveStateToDatabase";
import {
  chatReplySchema,
  sendMessageInputSchema,
} from "@typebot.io/bot-engine/schemas/legacy/schema";
import { startSession } from "@typebot.io/bot-engine/startSession";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import { createId } from "@typebot.io/lib/createId";
import { isDefined } from "@typebot.io/lib/utils";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";

export const sendMessageV1 = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/sendMessage",
      summary: "Send a message",
      description:
        "To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.",
      tags: ["Deprecated"],
      deprecated: true,
    },
  })
  .input(sendMessageInputSchema)
  .output(chatReplySchema)
  .mutation(
    async ({
      input: { sessionId, message, startParams, clientLogs },
      ctx: { user, origin, iframeReferrerOrigin },
    }) => {
      const session = sessionId ? await getSession(sessionId) : null;
      const newSessionId = sessionId ?? createId();

      const isSessionExpired =
        session &&
        isDefined(session.state.expiryTimeout) &&
        session.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

      if (isSessionExpired)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session expired. You need to start a new session.",
        });

      const sessionStore = getSessionStore(newSessionId);
      if (!session) {
        if (!startParams)
          throw new TRPCError({
            code: "BAD_REQUEST",
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
                      : "startEventId" in startParams &&
                          startParams.startEventId
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
                  message: message
                    ? { type: "text", text: message }
                    : undefined,
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
                  message: message
                    ? { type: "text", text: message }
                    : undefined,
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

        const session = startParams?.isOnlyRegistering
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
          sessionId: session.id,
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
    },
  );
