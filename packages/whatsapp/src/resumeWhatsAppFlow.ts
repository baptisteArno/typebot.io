import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
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
import { extensionFromMimeType } from "@typebot.io/lib/extensionFromMimeType";
import redis from "@typebot.io/lib/redis";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import { isDefined } from "@typebot.io/lib/utils";
import {
  deleteSessionStore,
  getSessionStore,
  type SessionStore,
} from "@typebot.io/runtime-session-store";
import { downloadMedia } from "./downloadMedia";
import type {
  WhatsAppIncomingMessage,
  WhatsAppMessageReferral,
} from "./schemas";
import { sendChatReplyToWhatsApp } from "./sendChatReplyToWhatsApp";
import { sendWhatsAppTypingIndicator } from "./sendWhatsAppTypingIndicator";
import { startWhatsAppSession } from "./startWhatsAppSession";
import { WhatsAppError } from "./WhatsAppError";

const MESSAGE_TOO_OLD_ELAPSED_MS = 3 * 60 * 1000; // 3 minutes
const INCOMING_MEDIA_MESSAGE_DEBOUNCE = 3_000;

type Props = {
  receivedMessages: WhatsAppIncomingMessage[];
  sessionId: string;
  credentialsId?: string;
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

  const credentials = await getWhatsAppCredentials({
    credentialsId,
    workspaceId,
    isPreview,
  });
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

  const session = await getSession(sessionId);
  if (session && !session.state)
    throw new WhatsAppError("Session is empty. Most likely in reply state.");

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
  else if (aggregationResponse.status === "treat as unique message") {
    await upsertSession(sessionId, {
      isReplying: true,
    });
  }

  const currentTypebot = session?.state?.typebotsQueue[0].typebot;
  const { block } =
    (currentTypebot && session?.state?.currentBlockId
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

  const sessionStore = getSessionStore(sessionId);
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
  deleteSessionStore(sessionId);

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
};

const convertWhatsAppMessageToTypebotMessage = async ({
  messages,
  workspaceId,
  credentials,
  typebotId,
  resultId,
  block,
}: {
  messages: WhatsAppIncomingMessage[];
  workspaceId?: string;
  credentials: WhatsAppCredentials["data"];
  typebotId?: string;
  resultId?: string;
  block?: Block;
}): Promise<Message | undefined> => {
  let text = "";
  const append = (s: string) => (text = text !== "" ? `${text}\n\n${s}` : s);
  let replyId: string | undefined;
  const attachedFileUrls: string[] = [];
  for (const message of messages) {
    switch (message.type) {
      case "text": {
        append(message.text.body);
        break;
      }
      case "button": {
        append(message.button.text);
        break;
      }
      case "interactive": {
        switch (message.interactive.type) {
          case "button_reply": {
            replyId = message.interactive.button_reply.id;
            append(message.interactive.button_reply.title);
            break;
          }
          case "list_reply": {
            replyId = message.interactive.list_reply.id;
            append(message.interactive.list_reply.title);
            break;
          }
        }
        break;
      }
      case "document":
      case "audio":
      case "video":
      case "sticker":
      case "image": {
        let mediaId: string | undefined;
        let mimeType: string | undefined;
        if (message.type === "video") {
          mediaId = message.video.id;
          mimeType = message.video.mime_type;
        }
        if (message.type === "image") {
          mediaId = message.image.id;
          mimeType = message.image.mime_type;
        }
        if (message.type === "audio") {
          mediaId = message.audio.id;
          mimeType = message.audio.mime_type;
        }
        if (message.type === "document") {
          mediaId = message.document.id;
          mimeType = message.document.mime_type;
        }
        if (message.type === "sticker") {
          mediaId = message.sticker.id;
          mimeType = message.sticker.mime_type;
        }
        if (!mediaId) continue;

        const fileVisibility =
          block?.type === InputBlockType.TEXT &&
          block.options?.audioClip?.isEnabled &&
          message.type === "audio"
            ? block.options?.audioClip.visibility
            : block?.type === InputBlockType.FILE
              ? block.options?.visibility
              : block?.type === InputBlockType.TEXT
                ? block.options?.attachments?.visibility
                : undefined;
        let fileUrl;
        if (fileVisibility !== "Public") {
          const extension = mimeType
            ? extensionFromMimeType[mimeType]
            : undefined;
          fileUrl =
            env.NEXTAUTH_URL +
            `/api/typebots/${typebotId}/whatsapp/media/${
              workspaceId ? `` : "preview/"
            }${mediaId}${extension ? `.${extension}` : ""}`;
        } else {
          const { file, mimeType } = await downloadMedia({
            mediaId,
            credentials,
          });
          const extension = extensionFromMimeType[mimeType];
          const url = await uploadFileToBucket({
            file,
            key:
              resultId && workspaceId && typebotId
                ? `public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${mediaId}${extension ? `.${extension}` : ""}`
                : `tmp/whatsapp/media/${mediaId}${extension ? `.${extension}` : ""}`,
            mimeType,
          });
          fileUrl = url;
        }
        if (message.type === "audio")
          return {
            type: "audio",
            url: fileUrl,
          };
        if (block?.type === InputBlockType.FILE) {
          append(fileUrl);
        } else if (block?.type === InputBlockType.TEXT) {
          let caption: string | undefined;
          if (message.type === "document" && message.document.caption) {
            const looksLikeFilename = /^[\w,\s-]+\.[A-Za-z0-9]{1,10}$/;
            if (!looksLikeFilename.test(message.document.caption))
              caption = message.document.caption;
          } else if (message.type === "image" && message.image.caption)
            caption = message.image.caption;
          else if (message.type === "video" && message.video.caption)
            caption = message.video.caption;
          if (caption) text = text === "" ? caption : `${text}\n\n${caption}`;
          attachedFileUrls.push(fileUrl);
        }
        break;
      }
      case "location": {
        const location = `${message.location.latitude}, ${message.location.longitude}`;
        append(location);
        break;
      }
      case "webhook": {
        if (!message.webhook.data) return;
        text = message.webhook.data;
      }
    }
  }

  return {
    type: "text",
    text,
    attachedFileUrls,
    metadata: { replyId },
  };
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
