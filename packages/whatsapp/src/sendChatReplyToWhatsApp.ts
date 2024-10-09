import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { computeTypingDuration } from "@typebot.io/bot-engine/computeTypingDuration";
import type { ContinueChatResponse } from "@typebot.io/bot-engine/schemas/api";
import type { SessionState } from "@typebot.io/bot-engine/schemas/chatSession";
import type { ClientSideAction } from "@typebot.io/bot-engine/schemas/clientSideAction";
import { isNotDefined } from "@typebot.io/lib/utils";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import { convertInputToWhatsAppMessages } from "./convertInputToWhatsAppMessage";
import { convertMessageToWhatsAppMessage } from "./convertMessageToWhatsAppMessage";
import type { WhatsAppCredentials, WhatsAppSendingMessage } from "./schemas";
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";

// Media can take some time to be delivered. This make sure we don't send a message before the media is delivered.
const messageAfterMediaTimeout = 5000;

type Props = {
  to: string;
  isFirstChatChunk: boolean;
  credentials: WhatsAppCredentials["data"];
  state: SessionState;
} & Pick<ContinueChatResponse, "messages" | "input" | "clientSideActions">;

export const sendChatReplyToWhatsApp = async ({
  to,
  isFirstChatChunk,
  messages,
  input,
  clientSideActions,
  credentials,
  state,
}: Props): Promise<ClientSideActionExecutionResult | undefined> => {
  const messagesBeforeInput = isLastMessageIncludedInInput(
    input,
    messages.at(-1),
  )
    ? messages.slice(0, -1)
    : messages;

  const sentMessages: WhatsAppSendingMessage[] = [];

  const clientSideActionsBeforeMessages =
    clientSideActions?.filter((action) =>
      isNotDefined(action.lastBubbleBlockId),
    ) ?? [];

  const result = await executeClientSideActions({
    clientSideActions: clientSideActionsBeforeMessages,
    to,
    credentials,
  });

  if (result) return result;

  let i = -1;
  for (const message of messagesBeforeInput) {
    i += 1;
    const delayBetweenBubbles =
      state.typingEmulation?.delayBetweenBubbles ??
      defaultSettings.typingEmulation.delayBetweenBubbles;
    if (i > 0 && delayBetweenBubbles > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayBetweenBubbles * 1000),
      );
    }
    const whatsAppMessage = convertMessageToWhatsAppMessage(message);
    if (isNotDefined(whatsAppMessage)) continue;
    const lastSentMessageIsMedia = ["audio", "video", "image"].includes(
      sentMessages.at(-1)?.type ?? "",
    );

    const isTypingEmulationDisabled =
      state.typingEmulation?.isDisabledOnFirstMessage ??
      defaultSettings.typingEmulation.isDisabledOnFirstMessage;

    const typingDuration = lastSentMessageIsMedia
      ? messageAfterMediaTimeout
      : isFirstChatChunk && i === 0 && isTypingEmulationDisabled
        ? 0
        : getTypingDuration({
            message: whatsAppMessage,
            typingEmulation: state.typingEmulation,
          });
    if ((typingDuration ?? 0) > 0)
      await new Promise((resolve) => setTimeout(resolve, typingDuration));
    await sendWhatsAppMessage({
      to,
      message: whatsAppMessage,
      credentials,
    });
    sentMessages.push(whatsAppMessage);
    const clientSideActionsAfterMessage =
      clientSideActions?.filter(
        (action) => action.lastBubbleBlockId === message.id,
      ) ?? [];
    const result = await executeClientSideActions({
      clientSideActions: clientSideActionsAfterMessage,
      to,
      credentials,
    });
    if (result) return result;
  }

  if (input) {
    const inputWhatsAppMessages = convertInputToWhatsAppMessages(
      input,
      messages.at(-1),
    );
    for (const message of inputWhatsAppMessages) {
      const lastSentMessageIsMedia = ["audio", "video", "image"].includes(
        sentMessages.at(-1)?.type ?? "",
      );
      const typingDuration = lastSentMessageIsMedia
        ? messageAfterMediaTimeout
        : getTypingDuration({
            message,
            typingEmulation: state.typingEmulation,
          });
      if (typingDuration)
        await new Promise((resolve) => setTimeout(resolve, typingDuration));
      await sendWhatsAppMessage({
        to,
        message,
        credentials,
      });
    }
  }
};

const getTypingDuration = ({
  message,
  typingEmulation,
}: {
  message: WhatsAppSendingMessage;
  typingEmulation?: Settings["typingEmulation"];
}): number | undefined => {
  switch (message.type) {
    case "text":
      return computeTypingDuration({
        bubbleContent: message.text.body,
        typingSettings: typingEmulation,
      });
    case "interactive":
      if (!message.interactive.body?.text) return;
      return computeTypingDuration({
        bubbleContent: message.interactive.body?.text ?? "",
        typingSettings: typingEmulation,
      });
    case "audio":
    case "video":
    case "image":
    case "template":
      return;
  }
};

const isLastMessageIncludedInInput = (
  input: ContinueChatResponse["input"],
  lastMessage?: ContinueChatResponse["messages"][number],
): boolean => {
  if (isNotDefined(input)) return false;
  return (
    input.type === InputBlockType.CHOICE &&
    (!lastMessage || lastMessage.type === BubbleBlockType.TEXT)
  );
};

const executeClientSideActions = async ({
  to,
  credentials,
  clientSideActions,
}: {
  clientSideActions: ClientSideAction[];
  to: string;
  credentials: WhatsAppCredentials["data"];
}) => {
  for (const action of clientSideActions) {
    const result = await executeClientSideAction({ to, credentials })(action);
    if (result) return result;
  }
};

type ClientSideActionExecutionResult =
  | { type: "replyToSend"; replyToSend: string | undefined }
  | { type: "shouldWaitForWebhook" }
  | undefined;
const executeClientSideAction =
  (context: { to: string; credentials: WhatsAppCredentials["data"] }) =>
  async (
    clientSideAction: NonNullable<
      ContinueChatResponse["clientSideActions"]
    >[number],
  ): Promise<ClientSideActionExecutionResult> => {
    if ("wait" in clientSideAction) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(clientSideAction.wait.secondsToWaitFor, 10) * 1000,
        ),
      );
      if (!clientSideAction.expectsDedicatedReply) return;
      return {
        type: "replyToSend",
        replyToSend: undefined,
      };
    }
    if ("redirect" in clientSideAction && clientSideAction.redirect.url) {
      const message = {
        type: "text",
        text: {
          body: clientSideAction.redirect.url,
          preview_url: true,
        },
      } satisfies WhatsAppSendingMessage;
      await sendWhatsAppMessage({
        to: context.to,
        message,
        credentials: context.credentials,
      });
    }
    if (clientSideAction.type === "listenForWebhook")
      return {
        type: "shouldWaitForWebhook",
      };
  };
