import type { CommandData } from "@/features/commands/types";
import { continueChatQuery } from "@/queries/continueChatQuery";
import { saveClientLogsQuery } from "@/queries/saveClientLogsQuery";
import type {
  BotContext,
  ChatChunk as ChatChunkType,
  InputSubmitContent,
} from "@/types";
import {
  type AvatarHistory,
  addAvatarsToHistoryIfChanged,
  initializeAvatarHistory,
} from "@/utils/avatarHistory";
import { botContainer } from "@/utils/botContainerSignal";
import { isNetworkError } from "@/utils/error";
import { executeClientSideAction } from "@/utils/executeClientSideActions";
import {
  formattedMessages,
  setFormattedMessages,
} from "@/utils/formattedMessagesSignal";
import { getAnswerContent } from "@/utils/getAnswerContent";
import { hiddenInput, setHiddenInput } from "@/utils/hiddenInputSignal";
import { setIsMediumContainer, setIsMobile } from "@/utils/isMobileSignal";
import { persist } from "@/utils/persist";
import { setGeneralBackground } from "@/utils/setCssVariablesValue";
import { setStreamingMessage } from "@/utils/streamingMessageSignal";
import { toaster } from "@/utils/toaster";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { ClientSideAction } from "@typebot.io/chat-api/clientSideAction";
import type {
  ContinueChatResponse,
  Message,
  StartChatResponse,
} from "@typebot.io/chat-api/schemas";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { latestTypebotVersion } from "@typebot.io/schemas/versions";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import {
  BackgroundType,
  defaultContainerBackgroundColor,
} from "@typebot.io/theme/constants";
import { cx } from "@typebot.io/ui/lib/cva";
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

const AUTO_SCROLL_CLIENT_HEIGHT_PERCENT_TOLERANCE = 0.6;
const AUTO_SCROLL_DELAY = 50;

type Props = {
  initialChatReply: StartChatResponse;
  context: BotContext;
  onNewInputBlock?: (inputBlock: InputBlock) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onEnd?: () => void;
  onNewLogs?: (logs: LogInSession[]) => void;
  onProgressUpdate?: (progress: number) => void;
  onScriptExecutionSuccess?: (message: string) => void;
};

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined;
  const resizeObserver = new ResizeObserver((entries) => {
    setIsMobile((entries[0]?.target.clientWidth ?? 0) < 432);
    setIsMediumContainer((entries[0]?.target.clientWidth ?? 0) < 550);
  });
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
  const [totalChunksDisplayed, setTotalChunksDisplayed] = persist(
    createSignal(0),
    {
      key: `typebot-${props.context.typebot.id}-totalChunksDisplayed`,
      storage: props.context.storage,
    },
  );
  const [isSending, setIsSending] = createSignal(false);
  const [isLastAutoScrollAtBottom, setIsLastAutoScrollAtBottom] =
    createSignal(true);
  const [hasError, setHasError] = createSignal(false);
  const [inputAnswered, setInputAnswered] = createSignal<{
    [key: string]: boolean;
  }>({});

  const [avatarsHistory, setAvatarsHistory] = persist(
    createSignal<AvatarHistory[]>(
      initializeAvatarHistory({
        initialTheme: props.initialChatReply.typebot.theme,
        dynamicTheme: props.initialChatReply.dynamicTheme,
      }),
    ),
    {
      key: `typebot-${props.context.typebot.id}-avatarsHistory`,
      storage: props.context.storage,
    },
  );

  onMount(() => {
    if (chatContainer) resizeObserver.observe(chatContainer);

    window.addEventListener("message", processIncomingEvent);
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

  createEffect((prevUrl: string | undefined) => {
    if (prevUrl === props.initialChatReply.typebot.theme.chat?.hostAvatar?.url)
      return prevUrl;
    setAvatarsHistory((prev) => [
      ...prev,
      {
        role: "host",
        chunkIndex: chatChunks().length - 1,
        avatarUrl: props.initialChatReply.typebot.theme.chat?.hostAvatar?.url,
      },
    ]);
    return props.initialChatReply.typebot.theme.chat?.hostAvatar?.url;
  }, props.initialChatReply.typebot.theme.chat?.hostAvatar?.url);

  createEffect((prevUrl: string | undefined) => {
    if (prevUrl === props.initialChatReply.typebot.theme.chat?.guestAvatar?.url)
      return prevUrl;
    setAvatarsHistory((prev) => [
      ...prev,
      {
        role: "guest",
        chunkIndex: chatChunks().length - 1,
        avatarUrl: props.initialChatReply.typebot.theme.chat?.guestAvatar?.url,
      },
    ]);
    return props.initialChatReply.typebot.theme.chat?.guestAvatar?.url;
  }, props.initialChatReply.typebot.theme.chat?.guestAvatar?.url);

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
    setIsLastAutoScrollAtBottom(false);
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

  const saveLogs = async (clientLogs?: LogInSession[]) => {
    if (!clientLogs) return;
    props.onNewLogs?.(clientLogs);
    if (props.context.isPreview) return;
    await saveClientLogsQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      clientLogs,
    });
  };

  const showOfflineErrorToast = () => {
    toaster.create({
      title:
        props.context.typebot.settings.general?.systemMessages
          ?.networkErrorTitle ?? defaultSystemMessages.networkErrorTitle,
      description:
        props.context.typebot.settings.general?.systemMessages
          ?.networkErrorMessage ?? defaultSystemMessages.networkErrorMessage,
    });
  };

  const sendMessage = async (answer?: InputSubmitContent) => {
    if (hasError() && clientSideActions().length > 0) {
      setHasError(false);
      await processClientSideActions(clientSideActions());
      return;
    }
    setHasError(false);
    const currentInputBlock = [...chatChunks()].pop()?.input;

    if (currentInputBlock?.id && answer) {
      if (props.onAnswer)
        props.onAnswer({
          message: getAnswerContent(answer),
          blockId: currentInputBlock.id,
        });
      setInputAnswered((prev) => ({
        ...prev,
        [parseInputUniqueKey(currentInputBlock.id)]: true,
      }));
    }

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

    await processContinueChatResponse({ data, error });

    if (!navigator.onLine || isNetworkError(error as Error)) {
      showOfflineErrorToast();
    }
  };

  const processContinueChatResponse = async ({
    data,
    error,
  }: { data: ContinueChatResponse | undefined; error: unknown }) => {
    if (error) {
      setHasError(true);
      const errorLogs = [
        await parseUnknownClientError({
          err: error,
          context: "While sending message",
        }),
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
    if (data.dynamicTheme) {
      setAvatarsHistory((prev) =>
        addAvatarsToHistoryIfChanged({
          newAvatars: {
            host: data.dynamicTheme?.hostAvatarUrl,
            guest: data.dynamicTheme?.guestAvatarUrl,
          },
          avatarHistory: prev,
          currentChunkIndex: chatChunks().length,
        }),
      );
      if (data.dynamicTheme?.backgroundUrl)
        setGeneralBackground({
          background: {
            type: BackgroundType.IMAGE,
            content: data.dynamicTheme?.backgroundUrl,
          },
          documentStyle:
            botContainer()?.style ?? document.documentElement.style,
          typebotVersion: latestTypebotVersion,
        });
    }
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
        messages: data.messages.filter((message) => {
          return (
            message.type !== "text" ||
            message.content.type !== "richText" ||
            message.content.richText.length > 1 ||
            message.content.richText[0].type !== "variable" ||
            message.content.richText[0].children.length > 0
          );
        }),
      },
    ]);
  };

  const autoScrollToBottom = ({
    lastElement,
    offset = 0,
  }: { lastElement?: HTMLDivElement; offset?: number } = {}) => {
    if (!chatContainer) return;

    const isBottomOfLastElementTooFarBelow =
      chatContainer.scrollTop + chatContainer.clientHeight <
      chatContainer.scrollHeight -
        chatContainer.clientHeight *
          AUTO_SCROLL_CLIENT_HEIGHT_PERCENT_TOLERANCE;

    if (isBottomOfLastElementTooFarBelow && !isLastAutoScrollAtBottom()) return;

    const onScrollEnd = (callback: () => void) => {
      let scrollTimeout: number;

      const scrollListener = () => {
        clearTimeout(scrollTimeout);

        scrollTimeout = window.setTimeout(() => {
          callback();
          chatContainer.removeEventListener("scroll", scrollListener);
        }, 100);
      };

      chatContainer.addEventListener("scroll", scrollListener, {
        passive: true,
      });
    };

    setTimeout(() => {
      onScrollEnd(() => {
        const isAtBottom =
          Math.abs(
            chatContainer.scrollHeight -
              chatContainer.scrollTop -
              chatContainer.clientHeight,
          ) < 2;
        setIsLastAutoScrollAtBottom(isAtBottom);
      });
      chatContainer?.scrollTo({
        top: lastElement
          ? lastElement.offsetTop - offset
          : chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }, AUTO_SCROLL_DELAY);
  };

  const handleAllBubblesDisplayed = async () => {
    if (chatChunks().length > totalChunksDisplayed())
      setTotalChunksDisplayed((prev) => prev + 1);
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
    let hasStreamError = false;
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
          wsHost: props.context.wsHost,
          sessionId: props.initialChatReply.sessionId,
          resultId: props.initialChatReply.resultId,
        },
        onMessageStream: streamMessage,
        onStreamError: async (error) => {
          setHasError(true);
          hasStreamError = true;
          await saveLogs([error]);
          props.onNewLogs?.([error]);
        },
      });
      if ("streamOpenAiChatCompletion" in action || "stream" in action) {
        setTotalChunksDisplayed((prev) => prev + 1);
        if (response && "replyToSend" in response && !response.replyToSend) {
          setIsSending(false);
          continue;
        }
      }
      if (hasStreamError) return;

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
          title:
            props.context.typebot.settings.general?.systemMessages
              ?.popupBlockedTitle ?? defaultSystemMessages.popupBlockedTitle,
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
    if (chatContainer) resizeObserver.unobserve(chatContainer);
    setStreamingMessage(undefined);
    setFormattedMessages([]);
    window.removeEventListener("message", processIncomingEvent);
  });

  const processIncomingEvent = async (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (
      !data.isFromTypebot ||
      (data.id && props.context.typebot.id !== data.id)
    )
      return;
    if (data.command === "sendCommand" && !isEnded())
      await sendCommandAndProcessResponse(data.text);
  };

  const sendCommandAndProcessResponse = async (
    command: string,
    retryCount = 0,
    maxRetries = 5,
  ) => {
    if (isSending()) {
      if (retryCount >= maxRetries) {
        throw new Error("Max retry attempts for command reached");
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      return sendCommandAndProcessResponse(command, retryCount + 1, maxRetries);
    }

    const currentInputBlock = [...chatChunks()].pop()?.input;
    if (
      currentInputBlock?.id &&
      !inputAnswered()[parseInputUniqueKey(currentInputBlock.id)]
    )
      setHiddenInput((prev) => ({
        ...prev,
        [parseInputUniqueKey(currentInputBlock.id)]: true,
      }));
    const longRequest = setTimeout(() => {
      setIsSending(true);
    }, 1000);
    autoScrollToBottom();
    const { data, error } = await continueChatQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message: {
        type: "command",
        command,
      },
    });
    clearTimeout(longRequest);
    setIsSending(false);
    return processContinueChatResponse({ data, error });
  };

  const parseInputUniqueKey = (id: string) =>
    `${id}-${chatChunks().length - 1}`;

  const handleSkip = () => sendMessage(undefined);

  return (
    <div
      ref={chatContainer}
      class={cx(
        "overflow-y-auto relative scrollable-container typebot-chat-view scroll-smooth w-full min-h-full flex flex-col items-center",
        (props.initialChatReply.typebot.theme.chat?.container
          ?.backgroundColor ?? defaultContainerBackgroundColor) !==
          "transparent" && "max-w-chat-container",
      )}
    >
      <div class="max-w-chat-container w-full flex flex-col gap-2">
        <For each={chatChunks().slice(0, totalChunksDisplayed() + 1)}>
          {(chatChunk, index) => (
            <ChatChunk
              index={index()}
              messages={chatChunk.messages}
              input={chatChunk.input}
              theme={props.initialChatReply.typebot.theme}
              avatarsHistory={avatarsHistory()}
              settings={props.initialChatReply.typebot.settings}
              streamingMessageId={chatChunk.streamingMessageId}
              context={props.context}
              hideAvatar={
                (!chatChunk.input ||
                  hiddenInput()[`${chatChunk.input.id}-${index()}`]) &&
                ((
                  chatChunks().slice(0, totalChunksDisplayed() + 1)[index() + 1]
                    ?.messages ?? []
                ).length > 0 ||
                  chatChunks().slice(0, totalChunksDisplayed() + 1)[index() + 1]
                    ?.streamingMessageId !== undefined ||
                  (chatChunk.messages.length > 0 && isSending()))
              }
              hasError={
                hasError() &&
                index() ===
                  chatChunks().slice(0, totalChunksDisplayed() + 1).length - 1
              }
              isTransitionDisabled={
                index() !==
                chatChunks().slice(0, totalChunksDisplayed() + 1).length - 1
              }
              isOngoingLastChunk={
                !isEnded() &&
                index() ===
                  chatChunks().slice(0, totalChunksDisplayed() + 1).length - 1
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
          <LoadingChunk
            theme={props.initialChatReply.typebot.theme}
            avatarSrc={
              avatarsHistory().findLast((avatar) => avatar.role === "host")
                ?.avatarUrl
            }
          />
        </Show>
      </div>

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
