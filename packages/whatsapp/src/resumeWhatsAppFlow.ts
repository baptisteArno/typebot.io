import { continueBotFlow } from "@typebot.io/bot-engine/continueBotFlow";
import { saveStateToDatabase } from "@typebot.io/bot-engine/saveStateToDatabase";
import type { Message } from "@typebot.io/chat-api/schemas";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { upsertSession } from "@typebot.io/chat-session/queries/upsertSession";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import redis from "@typebot.io/lib/redis";
import { isDefined } from "@typebot.io/lib/utils";
import {
  type SessionStore,
  withSessionStore,
} from "@typebot.io/runtime-session-store";
import { convertWhatsAppMessageToTypebotMessage } from "./convertWhatsAppMessageToTypebotMessage";
import type {
  WhatsAppIncomingMessage,
  WhatsAppMessageReferral,
} from "./schemas";
import { sendChatReplyToWhatsApp } from "./sendChatReplyToWhatsApp";
import { sendWhatsAppTypingIndicator } from "./sendWhatsAppTypingIndicator";
import { startWhatsAppSession } from "./startWhatsAppSession";
import { WhatsAppError } from "./WhatsAppError";

const MESSAGE_TOO_OLD_ELAPSED_MS = 3 * 60 * 1000; // 3 minutes
const RESET_EMPTY_SESSION_AFTER_MS = 10 * 60 * 1000; // 10 minutes
const INCOMING_MEDIA_MESSAGE_DEBOUNCE = 3_000;

type Props = {
  receivedMessages: WhatsAppIncomingMessage[];
  sessionId: string;
  credentialsId?: string;
  credentialsData?: WhatsAppCredentials["data"];
  phoneNumberId?: string;
  workspaceId?: string;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  callFrom?: "webhook";
};

const areMessagesTooOld = (receivedMessages: WhatsAppIncomingMessage[]) => {
  return receivedMessages.every(
    (message) =>
      new Date(Number(message.timestamp) * 1000).getTime() <
      Date.now() - MESSAGE_TOO_OLD_ELAPSED_MS,
  );
};

export const resumeWhatsAppFlow = async ({
  receivedMessages,
  referral,
  sessionId,
  workspaceId,
  credentialsId,
  credentialsData,
  phoneNumberId,
  contact,
  callFrom,
}: Props) => {
  if (receivedMessages.length === 0)
    throw new WhatsAppError("Received messages is empty");
  if (areMessagesTooOld(receivedMessages))
    throw new WhatsAppError("Message is too old", {
      timestamps: receivedMessages.map((message) => message.timestamp),
    });

  const isPreview = workspaceId === undefined || credentialsId === undefined;

  const credentials =
    credentialsData ??
    (await getWhatsAppCredentials({
      credentialsId,
      workspaceId,
      isPreview,
    }));
  if (!credentials) throw new WhatsAppError("Could not find credentials");

  if (
    phoneNumberId &&
    credentials.provider === "meta" &&
    credentials.phoneNumberId !== phoneNumberId
  )
    throw new WhatsAppError("Credentials point to another phone ID", {
      credentialsPhoneNumberId: credentials.phoneNumberId,
      receivedPhoneNumberId: phoneNumberId,
    });

  let session = await getSession(sessionId);

  if (session && !session.state) {
    if (
      session.updatedAt.getTime() + RESET_EMPTY_SESSION_AFTER_MS <
      Date.now()
    ) {
      console.warn("Old empty session, resetting...");
      session = null;
    } else {
      throw new WhatsAppError(
        "Session is empty. Most likely a new session with initial reply state.",
      );
    }
  }

  const aggregationResponse =
    await aggregateParallelMediaMessagesIfRedisEnabled({
      receivedMessages,
      sessionId,
    });

  if (aggregationResponse.status === "found newer message")
    throw new WhatsAppError("Found newer message, skipping this one");

  const isSessionExpired =
    isDefined(session?.state) &&
    isDefined(session.state.expiryTimeout) &&
    session?.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

  if (!isSessionExpired && session?.isReplying && callFrom !== "webhook")
    throw new WhatsAppError("Is in reply state");
  if (aggregationResponse.status === "treat as unique message") {
    await upsertSession(sessionId, {
      isReplying: true,
    });
  }

  const currentTypebot = session?.state?.typebotsQueue[0].typebot;
  const { block } =
    (!isSessionExpired && currentTypebot && session?.state?.currentBlockId
      ? getBlockById(session.state.currentBlockId, currentTypebot.groups)
      : undefined) ?? {};
  const reply = await convertWhatsAppMessageToTypebotMessage({
    messages: aggregationResponse.incomingMessages,
    workspaceId,
    credentials,
    typebotId: currentTypebot?.id,
    resultId: session?.state?.typebotsQueue[0].resultId,
    block,
  });

  await withSessionStore(sessionId, async (sessionStore) => {
    const {
      input,
      logs,
      visitedEdges,
      setVariableHistory,
      newSessionState,
      isWaitingForWebhook,
    } = await resumeFlowAndSendWhatsAppMessages({
      to: receivedMessages[0].from,
      messageId: receivedMessages[0].id,
      credentials,
      isSessionExpired,
      reply,
      state: session?.state,
      sessionStore,
      contact,
      workspaceId,
      credentialsId,
      referral,
    });

    await saveStateToDatabase({
      clientSideActions: [],
      input,
      logs,
      sessionId: {
        type: "existing",
        id: sessionId,
      },
      session: {
        state: {
          ...newSessionState,
          currentBlockId:
            !input && !isWaitingForWebhook
              ? undefined
              : newSessionState.currentBlockId,
        },
      },
      isWaitingForExternalEvent: isWaitingForWebhook,
      visitedEdges,
      setVariableHistory,
    });
  });
};

const getWhatsAppCredentials = async ({
  credentialsId,
  workspaceId,
  isPreview,
}: {
  credentialsId?: string;
  workspaceId?: string;
  isPreview: boolean;
}): Promise<WhatsAppCredentials["data"] | undefined> => {
  if (isPreview) {
    if (
      !env.META_SYSTEM_USER_TOKEN ||
      !env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID
    )
      return;
    return {
      provider: "meta",
      systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
      phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID,
    };
  }

  if (!credentialsId || !workspaceId) return;

  const credentials = await getCredentials(credentialsId, workspaceId);
  if (!credentials) return;
  const data = (await decrypt(
    credentials.data,
    credentials.iv,
  )) as WhatsAppCredentials["data"];
  return data;
};

/**
 * Leverages Redis to aggregate incoming media messages.
 * For now, only used for media messages because they are by default sent as multiple sequential messages by WhatsApp.
 */
const aggregateParallelMediaMessagesIfRedisEnabled = async ({
  receivedMessages,
  sessionId,
}: {
  receivedMessages: WhatsAppIncomingMessage[];
  sessionId: string;
}): Promise<
  | {
      status: "treat as unique message";
      incomingMessages: WhatsAppIncomingMessage[];
    }
  | {
      status: "found newer message";
    }
  | {
      status: "ready to reply";
      incomingMessages: WhatsAppIncomingMessage[];
    }
> => {
  if (
    redis &&
    ["document", "video", "image"].includes(receivedMessages[0].type)
  ) {
    const redisKey = `wasession:${sessionId}`;
    try {
      const len = await redis.rpush(
        redisKey,
        JSON.stringify(receivedMessages[0]),
      );

      if (len === 1) {
        await upsertSession(sessionId, {
          isReplying: true,
        });
      }

      await new Promise((resolve) =>
        setTimeout(resolve, INCOMING_MEDIA_MESSAGE_DEBOUNCE),
      );

      const newMessagesResponse = await redis.lrange(redisKey, 0, -1);

      if (!newMessagesResponse || newMessagesResponse.length > len)
        return { status: "found newer message" };

      redis.del(redisKey).then();

      return {
        status: "ready to reply",
        incomingMessages: newMessagesResponse.map((msgStr) =>
          JSON.parse(msgStr),
        ),
      };
    } catch (error) {
      console.error(
        "Failed to process webhook event:",
        error,
        receivedMessages,
      );
    }
  }

  return {
    status: "treat as unique message",
    incomingMessages: receivedMessages,
  };
};

const resumeFlowAndSendWhatsAppMessages = async (props: {
  to: string;
  messageId: string | undefined;
  state: SessionState | null | undefined;
  sessionStore: SessionStore;
  reply: Message | undefined;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  credentials: WhatsAppCredentials["data"];
  isSessionExpired: boolean | null;
  credentialsId?: string;
  workspaceId?: string;
}) => {
  if (props.messageId) {
    sendWhatsAppTypingIndicator({
      messageId: props.messageId,
      credentials: props.credentials,
    });
  }

  const resumeResponse = await resumeFlow(props);

  const {
    input,
    logs,
    messages,
    clientSideActions,
    visitedEdges,
    setVariableHistory,
    newSessionState,
  } = resumeResponse;

  const isFirstChatChunk = (!props.state || props.isSessionExpired) ?? false;
  const result = await sendChatReplyToWhatsApp({
    to: props.to,
    messages,
    input,
    isFirstChatChunk,
    clientSideActions,
    credentials: props.credentials,
    state: newSessionState,
  });
  if (result?.type === "replyToSend")
    return resumeFlowAndSendWhatsAppMessages({
      ...props,
      state: newSessionState,
      reply: result.replyToSend
        ? {
            type: "text",
            text: result.replyToSend,
          }
        : undefined,
    });

  return {
    input,
    logs,
    visitedEdges,
    setVariableHistory,
    newSessionState,
    isWaitingForWebhook: result?.type === "shouldWaitForWebhook",
  };
};

const resumeFlow = ({
  state,
  isSessionExpired,
  reply,
  contact,
  referral,
  credentials,
  credentialsId,
  workspaceId,
  sessionStore,
}: {
  reply: Message | undefined;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  state: SessionState | null | undefined;
  credentials: WhatsAppCredentials["data"];
  isSessionExpired: boolean | null;
  credentialsId?: string;
  workspaceId?: string;
  sessionStore: SessionStore;
}) => {
  if (state && !isSessionExpired)
    return continueBotFlow(reply, {
      version: 2,
      sessionStore,
      state: contact
        ? {
            ...state,
            whatsApp: {
              contact,
              referral: referral
                ? {
                    sourceId: referral.source_id,
                    ctwaClickId: referral.ctwa_clid,
                  }
                : undefined,
            },
          }
        : state,
      textBubbleContentFormat: "richText",
    });
  if (!workspaceId || !contact)
    throw new WhatsAppError(
      "Can't start WhatsApp session without workspaceId or contact",
    );
  return startWhatsAppSession({
    incomingMessage: reply,
    workspaceId,
    credentials: { ...credentials, id: credentialsId as string },
    contact,
    referral,
    sessionStore,
  });
};
