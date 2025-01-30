import { continueChatQuery } from "@/queries/continueChatQuery";
import { saveClientLogsQuery } from "@/queries/saveClientLogsQuery";
import type {
  BotContext,
  ChatChunk as ChatChunkType,
  InputSubmitContent,
  OutgoingLog,
} from "@/types";
import { executeClientSideAction } from "@/utils/executeClientSideActions";
import {
  formattedMessages,
  setFormattedMessages,
} from "@/utils/formattedMessagesSignal";
import { getAnswerContent } from "@/utils/getAnswerContent";
import { persist } from "@/utils/persist";
import { setStreamingMessage } from "@/utils/streamingMessageSignal";
import { toaster } from "@/utils/toaster";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type {
  ChatLog,
  ContinueChatResponse,
  Message,
  StartChatResponse,
} from "@typebot.io/bot-engine/schemas/api";
import type { ClientSideAction } from "@typebot.io/bot-engine/schemas/clientSideAction";
import { isNotDefined } from "@typebot.io/lib/utils";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import type { Theme } from "@typebot.io/theme/schemas";
import { HTTPError } from "ky";
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { ChatChunk } from "./ChatChunk";
import { LoadingChunk } from "./LoadingChunk";
import { PopupBlockedToast } from "./PopupBlockedToast";

const AUTO_SCROLL_CLIENT_HEIGHT_PERCENT_TOLERANCE = 0.6;
const AUTO_SCROLL_DELAY = 50;

const parseDynamicTheme = (
  initialTheme: Theme,
  dynamicTheme: ContinueChatResponse["dynamicTheme"],
): Theme => ({
  ...initialTheme,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat?.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
            ...initialTheme.chat.hostAvatar,
            url: dynamicTheme.hostAvatarUrl,
          }
        : initialTheme.chat?.hostAvatar,
    guestAvatar:
      initialTheme.chat?.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
            ...initialTheme.chat.guestAvatar,
            url: dynamicTheme?.guestAvatarUrl,
          }
        : initialTheme.chat?.guestAvatar,
  },
});

type Props = {
  initialChatReply: StartChatResponse;
  context: BotContext;
  onNewInputBlock?: (inputBlock: InputBlock) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onEnd?: () => void;
  onNewLogs?: (logs: OutgoingLog[]) => void;
  onProgressUpdate?: (progress: number) => void;
  onScriptExecutionSuccess?: (message: string) => void;
};

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
  const [chatChunks, setChatChunks] = persist(
    createSignal<ChatChunkType[]>([
      {
        input: props.initialChatReply.input,
        messages: props.initialChatReply.messages,
      },
    ]),
    {
      key: `typebot-${props.context.typebot.id}-chatChunks`,
      storage: props.context.storage,
      onRecovered: () => {
        setTimeout(() => {
          chatContainer?.scrollTo(0, chatContainer.scrollHeight);
        }, 200);
      },
    },
  );
  const [clientSideActions, setClientSideActions] = persist(
    createSignal<ClientSideAction[]>(
      props.initialChatReply.clientSideActions ?? [],
    ),
    {
      key: `typebot-${props.context.typebot.id}-clientSideActions`,
      storage: props.context.storage,
    },
  );
  const [isEnded, setIsEnded] = persist(createSignal(false), {
    key: `typebot-${props.context.typebot.id}-isEnded`,
    storage: props.context.storage,
  });
  const [dynamicTheme, setDynamicTheme] = createSignal<
    ContinueChatResponse["dynamicTheme"]
  >(props.initialChatReply.dynamicTheme);
  const [theme, setTheme] = createSignal(props.initialChatReply.typebot.theme);
  const [isSending, setIsSending] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);

  onMount(() => {
    (async () => {
      const isRecoveredFromStorage = chatChunks().length > 1;
      if (isRecoveredFromStorage) {
        cleanupRecoveredChat();
      } else {
        const actionsBeforeFirstBubble = clientSideActions()?.filter((action) =>
          isNotDefined(action.lastBubbleBlockId),
        );
        await processClientSideActions(actionsBeforeFirstBubble);
      }
    })();
  });

  const cleanupRecoveredChat = () => {
    if ([...chatChunks()].pop()?.streamingMessageId)
      setChatChunks((chunks) => chunks.slice(0, -1));
    const actionsBeforeFirstBubble = getNextClientSideActionsBatch({
      clientSideActions: clientSideActions(),
      lastBubbleBlockId: undefined,
    });
    setClientSideActions((actions) =>
      actions.slice(actionsBeforeFirstBubble.length),
    );
  };

  const streamMessage = ({ id, message }: { id: string; message: string }) => {
    setIsSending(false);
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;
    if (lastChunk.streamingMessageId !== id)
      setChatChunks((displayedChunks) => [
        ...displayedChunks,
        {
          messages: [],
          streamingMessageId: id,
        },
      ]);
    setStreamingMessage({ id, content: message });
  };

  createEffect(() => {
    setTheme(
      parseDynamicTheme(props.initialChatReply.typebot.theme, dynamicTheme()),
    );
  });

  const saveLogs = async (clientLogs?: ChatLog[]) => {
    if (!clientLogs) return;
    props.onNewLogs?.(clientLogs);
    if (props.context.isPreview) return;
    await saveClientLogsQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      clientLogs,
    });
  };

  const sendMessage = async (answer?: InputSubmitContent) => {
    setHasError(false);
    const currentInputBlock = [...chatChunks()].pop()?.input;
    if (currentInputBlock?.id && props.onAnswer && answer)
      props.onAnswer({
        message: getAnswerContent(answer),
        blockId: currentInputBlock.id,
      });
    const longRequest = setTimeout(() => {
      setIsSending(true);
    }, 1000);
    autoScrollToBottom();
    const { data, error } = await continueChatQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message: convertSubmitContentToMessage(answer),
    });
    clearTimeout(longRequest);
    setIsSending(false);
    if (error) {
      setHasError(true);
      const errorLogs = [
        {
          description: "Failed to send the reply",
          details:
            error instanceof HTTPError
              ? {
                  status: error.response.status,
                  body: await error.response.json(),
                }
              : error,
          status: "error",
        },
      ];
      await saveClientLogsQuery({
        apiHost: props.context.apiHost,
        sessionId: props.initialChatReply.sessionId,
        clientLogs: errorLogs,
      });
      props.onNewLogs?.(errorLogs);
      return;
    }
    if (!data) return;
    if (data.progress) props.onProgressUpdate?.(data.progress);
    if (data.lastMessageNewFormat) {
      setFormattedMessages([
        ...formattedMessages(),
        {
          inputIndex: [...chatChunks()].length - 1,
          formattedMessage: data.lastMessageNewFormat as string,
        },
      ]);
    }
    if (data.logs) props.onNewLogs?.(data.logs);
    if (data.dynamicTheme) setDynamicTheme(data.dynamicTheme);
    if (data.input && props.onNewInputBlock) {
      props.onNewInputBlock(data.input);
    }
    if (data.clientSideActions) {
      setClientSideActions(data.clientSideActions);
      const actionsBeforeFirstBubble = getNextClientSideActionsBatch({
        clientSideActions: data.clientSideActions,
        lastBubbleBlockId: undefined,
      });
      await processClientSideActions(actionsBeforeFirstBubble);
      if (
        data.clientSideActions.length === 1 &&
        data.clientSideActions[0]!.type === "stream" &&
        data.messages.length === 0 &&
        data.input === undefined
      )
        return;
    }
    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: data.messages,
      },
    ]);
  };

  const autoScrollToBottom = (lastElement?: HTMLDivElement, offset = 0) => {
    if (!chatContainer) return;

    const isBottomOfLastElementTooFarBelow =
      chatContainer.scrollTop + chatContainer.clientHeight <
      chatContainer.scrollHeight -
        chatContainer.clientHeight *
          AUTO_SCROLL_CLIENT_HEIGHT_PERCENT_TOLERANCE;

    if (isBottomOfLastElementTooFarBelow) return;

    setTimeout(() => {
      chatContainer?.scrollTo({
        top: lastElement
          ? lastElement.offsetTop - offset
          : chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }, AUTO_SCROLL_DELAY);
  };

  const handleAllBubblesDisplayed = async () => {
    const lastChunk = [...chatChunks()].pop();
    if (!lastChunk) return;
    if (isNotDefined(lastChunk.input)) {
      setIsEnded(true);
      props.onEnd?.();
    }
  };

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const actionsToExecute = getNextClientSideActionsBatch({
      clientSideActions: clientSideActions(),
      lastBubbleBlockId: blockId,
    });
    await processClientSideActions(actionsToExecute);
  };

  const processClientSideActions = async (actions: ClientSideAction[]) => {
    for (const action of actions) {
      if (
        "streamOpenAiChatCompletion" in action ||
        "webhookToExecute" in action ||
        "stream" in action
      )
        setIsSending(true);
      const response = await executeClientSideAction({
        clientSideAction: action,
        context: {
          apiHost: props.context.apiHost,
          sessionId: props.initialChatReply.sessionId,
          resultId: props.initialChatReply.resultId,
        },
        onMessageStream: streamMessage,
      });
      setClientSideActions((actions) => actions.slice(1));
      if (response && "logs" in response) saveLogs(response.logs);
      if (response && "replyToSend" in response) {
        setIsSending(false);
        sendMessage(
          response.replyToSend
            ? { type: "text", value: response.replyToSend }
            : undefined,
        );
        return;
      }
      if (response && "blockedPopupUrl" in response) {
        toaster.create({
          description:
            props.context.typebot.settings.general?.systemMessages
              ?.popupBlockedDescription ??
            defaultSystemMessages.popupBlockedDescription,
          meta: {
            link: response.blockedPopupUrl,
          },
        });
      }
      if (response && "scriptCallbackMessage" in response)
        props.onScriptExecutionSuccess?.(response.scriptCallbackMessage);
    }
  };

  onCleanup(() => {
    setStreamingMessage(undefined);
    setFormattedMessages([]);
  });

  const handleSkip = () => sendMessage(undefined);

  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-auto w-full relative scrollable-container typebot-chat-view scroll-smooth gap-2"
    >
      <For each={chatChunks()}>
        {(chatChunk, index) => (
          <ChatChunk
            index={index()}
            messages={chatChunk.messages}
            input={chatChunk.input}
            theme={theme()}
            settings={props.initialChatReply.typebot.settings}
            streamingMessageId={chatChunk.streamingMessageId}
            context={props.context}
            hideAvatar={
              !chatChunk.input &&
              ((chatChunks()[index() + 1]?.messages ?? []).length > 0 ||
                chatChunks()[index() + 1]?.streamingMessageId !== undefined ||
                (chatChunk.messages.length > 0 && isSending()))
            }
            hasError={hasError() && index() === chatChunks().length - 1}
            isTransitionDisabled={index() !== chatChunks().length - 1}
            isOngoingLastChunk={
              !isEnded() && index() === chatChunks().length - 1
            }
            onNewBubbleDisplayed={handleNewBubbleDisplayed}
            onAllBubblesDisplayed={handleAllBubblesDisplayed}
            onSubmit={sendMessage}
            onScrollToBottom={autoScrollToBottom}
            onSkip={handleSkip}
          />
        )}
      </For>
      <Show when={isSending()}>
        <LoadingChunk theme={theme()} />
      </Show>
      <BottomSpacer />
    </div>
  );
};

// Needed because we need to simulate a bottom padding relative to the chat view height
const BottomSpacer = () => (
  <div class="w-full flex-shrink-0 typebot-bottom-spacer h-[20%]" />
);

const convertSubmitContentToMessage = (
  answer: InputSubmitContent | undefined,
): Message | undefined => {
  if (!answer) return;
  if (answer.type === "text")
    return {
      type: "text",
      text: answer.value,
      attachedFileUrls: answer.attachments?.map((attachment) => attachment.url),
    };
  if (answer.type === "recording") return { type: "audio", url: answer.url };
};

const getNextClientSideActionsBatch = ({
  clientSideActions,
  lastBubbleBlockId,
}: {
  clientSideActions: ClientSideAction[];
  lastBubbleBlockId: string | undefined;
}) => {
  const actionsBatch: ClientSideAction[] = [];
  let currentLastBubbleBlockId = lastBubbleBlockId;
  for (const action of clientSideActions) {
    if (currentLastBubbleBlockId !== action.lastBubbleBlockId) break;
    currentLastBubbleBlockId = action.lastBubbleBlockId;
    if (lastBubbleBlockId === action.lastBubbleBlockId)
      actionsBatch.push(action);
  }
  return actionsBatch;
};
