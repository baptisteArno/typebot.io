import * as Sentry from "@sentry/nextjs";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { continueBotFlow } from "@typebot.io/bot-engine/continueBotFlow";
import { saveStateToDatabase } from "@typebot.io/bot-engine/saveStateToDatabase";
import type { ChatSession, Message } from "@typebot.io/bot-engine/schemas/api";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { setIsReplyingInChatSession } from "@typebot.io/chat-session/queries/setIsReplyingInChatSession";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import redis from "@typebot.io/lib/redis";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import { isDefined } from "@typebot.io/lib/utils";
import { WhatsAppError } from "./WhatsAppError";
import { downloadMedia } from "./downloadMedia";
import type {
  WhatsAppIncomingMessage,
  WhatsAppMessageReferral,
} from "./schemas";
import { sendChatReplyToWhatsApp } from "./sendChatReplyToWhatsApp";
import { startWhatsAppSession } from "./startWhatsAppSession";

const incomingMessageDebounce = 3000;

type Props = {
  receivedMessage: WhatsAppIncomingMessage;
  sessionId: string;
  credentialsId?: string;
  phoneNumberId?: string;
  workspaceId?: string;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  callFrom?: "webhook";
};

const isMessageTooOld = (receivedMessage: WhatsAppIncomingMessage) => {
  const messageSendDate = new Date(Number(receivedMessage.timestamp) * 1000);
  return messageSendDate.getTime() < Date.now() - 180000;
};

export const resumeWhatsAppFlow = async ({
  receivedMessage,
  sessionId,
  workspaceId,
  credentialsId,
  phoneNumberId,
  contact,
  callFrom,
}: Props) => {
  if (workspaceId) Sentry.setUser({ id: workspaceId });
  if (isMessageTooOld(receivedMessage))
    throw new WhatsAppError("Message is too old", {
      timestamp: receivedMessage.timestamp,
    });

  const isPreview = workspaceId === undefined || credentialsId === undefined;

  const credentials = await getWhatsAppCredentials({
    credentialsId,
    workspaceId,
    isPreview,
  });
  if (!credentials) throw new WhatsAppError("Could not find credentials");

  if (phoneNumberId && credentials.phoneNumberId !== phoneNumberId)
    throw new WhatsAppError("Credentials point to another phone ID", {
      credentialsPhoneNumberId: credentials.phoneNumberId,
      receivedPhoneNumberId: phoneNumberId,
    });

  const session = await getSession(sessionId);

  const aggregationResponse =
    await aggregateParallelMediaMessagesIfRedisEnabled({
      receivedMessage,
      existingSessionId: session?.id,
      newSessionId: sessionId,
    });

  if (aggregationResponse.status === "found newer message")
    throw new WhatsAppError("Found newer message, skipping this one");

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session?.updatedAt.getTime() + session.state.expiryTimeout < Date.now();

  if (aggregationResponse.status === "treat as unique message") {
    if (session?.isReplying && callFrom !== "webhook") {
      if (!isSessionExpired) throw new WhatsAppError("Is in reply state");
    } else {
      await setIsReplyingInChatSession({
        existingSessionId: session?.id,
        newSessionId: sessionId,
      });
    }
  }

  const currentTypebot = session?.state.typebotsQueue[0].typebot;
  const { block } =
    (currentTypebot && session?.state.currentBlockId
      ? getBlockById(session.state.currentBlockId, currentTypebot.groups)
      : undefined) ?? {};
  const reply = await convertWhatsAppMessageToTypebotMessage({
    messages: aggregationResponse.incomingMessages,
    workspaceId,
    accessToken: credentials?.systemUserAccessToken,
    typebotId: currentTypebot?.id,
    resultId: session?.state.typebotsQueue[0].resultId,
    block,
  });

  const {
    input,
    logs,
    visitedEdges,
    setVariableHistory,
    newSessionState,
    isWaitingForWebhook,
  } = await resumeFlowAndSendWhatsAppMessages({
    to: receivedMessage.from,
    credentials,
    isSessionExpired,
    reply,
    session,
    sessionId,
    contact,
    workspaceId,
    credentialsId,
  });

  await saveStateToDatabase({
    clientSideActions: [],
    input,
    logs,
    session: {
      id: sessionId,
      isReplying: isWaitingForWebhook,
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
  accessToken,
  typebotId,
  resultId,
  block,
}: {
  messages: WhatsAppIncomingMessage[];
  workspaceId?: string;
  accessToken: string;
  typebotId?: string;
  resultId?: string;
  block?: Block;
}): Promise<Message | undefined> => {
  let text = "";
  const attachedFileUrls: string[] = [];
  for (const message of messages) {
    switch (message.type) {
      case "text": {
        if (text !== "") text += `\n\n${message.text.body}`;
        else text = message.text.body;
        break;
      }
      case "button": {
        if (text !== "") text += `\n\n${message.button.text}`;
        else text = message.button.text;
        break;
      }
      case "interactive": {
        switch (message.interactive.type) {
          case "button_reply":
            if (text !== "")
              text += `\n\n${message.interactive.button_reply.id}`;
            else text = message.interactive.button_reply.id;
            break;
          case "list_reply":
            if (text !== "") text += `\n\n${message.interactive.list_reply.id}`;
            else text = message.interactive.list_reply.id;
            break;
        }
        break;
      }
      case "document":
      case "audio":
      case "video":
      case "sticker":
      case "image": {
        let mediaId: string | undefined;
        if (message.type === "video") mediaId = message.video.id;
        if (message.type === "image") mediaId = message.image.id;
        if (message.type === "audio") mediaId = message.audio.id;
        if (message.type === "document") mediaId = message.document.id;
        if (message.type === "sticker") mediaId = message.sticker.id;
        if (!mediaId) return;
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
          fileUrl =
            env.NEXTAUTH_URL +
            `/api/typebots/${typebotId}/whatsapp/media/${
              workspaceId ? `` : "preview/"
            }${mediaId}`;
        } else {
          const { file, mimeType } = await downloadMedia({
            mediaId,
            systemUserAccessToken: accessToken,
          });
          const url = await uploadFileToBucket({
            file,
            key:
              resultId && workspaceId && typebotId
                ? `public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${mediaId}`
                : `tmp/whatsapp/media/${mediaId}`,
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
          if (text !== "") text += `, ${fileUrl}`;
          else text = fileUrl;
        } else if (block?.type === InputBlockType.TEXT) {
          let caption: string | undefined;
          if (message.type === "document" && message.document.caption) {
            if (!/^[\w,\s-]+\.[A-Za-z]{3}$/.test(message.document.caption))
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
        if (text !== "") text += `\n\n${location}`;
        else text = location;
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
  return {
    systemUserAccessToken: data.systemUserAccessToken,
    phoneNumberId: data.phoneNumberId,
  };
};

const aggregateParallelMediaMessagesIfRedisEnabled = async ({
  receivedMessage,
  existingSessionId,
  newSessionId,
}: {
  receivedMessage: WhatsAppIncomingMessage;
  existingSessionId?: string;
  newSessionId: string;
}): Promise<
  | {
      status: "treat as unique message";
      incomingMessages: [WhatsAppIncomingMessage];
    }
  | {
      status: "found newer message";
    }
  | {
      status: "ready to reply";
      incomingMessages: WhatsAppIncomingMessage[];
    }
> => {
  if (redis && ["document", "video", "image"].includes(receivedMessage.type)) {
    const redisKey = `wasession:${newSessionId}`;
    try {
      const len = await redis.rpush(redisKey, JSON.stringify(receivedMessage));

      if (len === 1) {
        await setIsReplyingInChatSession({
          existingSessionId,
          newSessionId,
        });
      }

      await new Promise((resolve) =>
        setTimeout(resolve, incomingMessageDebounce),
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
      console.error("Failed to process webhook event:", error, receivedMessage);
    }
  }

  return {
    status: "treat as unique message",
    incomingMessages: [receivedMessage],
  };
};

const resumeFlowAndSendWhatsAppMessages = async (props: {
  to: string;
  session: Pick<ChatSession, "state"> | null;
  sessionId: string;
  reply: Message | undefined;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  credentials: WhatsAppCredentials["data"];
  isSessionExpired: boolean | null;
  credentialsId?: string;
  workspaceId?: string;
}) => {
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

  const isFirstChatChunk = (!props.session || props.isSessionExpired) ?? false;
  const result = await sendChatReplyToWhatsApp({
    to: props.to,
    messages,
    input,
    isFirstChatChunk,
    clientSideActions,
    credentials: props.credentials,
    state: resumeResponse.newSessionState,
  });
  if (result?.type === "replyToSend")
    return resumeFlowAndSendWhatsAppMessages({
      ...props,
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
  session,
  isSessionExpired,
  reply,
  contact,
  referral,
  credentials,
  credentialsId,
  workspaceId,
}: {
  reply: Message | undefined;
  contact?: NonNullable<SessionState["whatsApp"]>["contact"];
  referral?: WhatsAppMessageReferral;
  session: Pick<ChatSession, "state"> | null;
  credentials: WhatsAppCredentials["data"];
  isSessionExpired: boolean | null;
  credentialsId?: string;
  workspaceId?: string;
}) => {
  if (session?.state && !isSessionExpired)
    return continueBotFlow(reply, {
      version: 2,
      state: contact
        ? {
            ...session.state,
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
        : session.state,
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
  });
};
