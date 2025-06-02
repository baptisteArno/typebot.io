import { useBotContainer } from "@/contexts/BotContainerContext";
import {
  ChatContainerSizeContext,
  createChatContainerProviderValue,
} from "@/contexts/ChatContainerSizeContext";
import type { CommandData } from "@/features/commands/types";
import { continueChatQuery } from "@/queries/continueChatQuery";
import { saveClientLogsQuery } from "@/queries/saveClientLogsQuery";
import type {
  BotContext,
  ChatChunk as ChatChunkType,
  ClientSideResult,
  InputSubmitContent,
} from "@/types";
import { mergeThemes } from "@/utils/dynamicTheme";
import { isNetworkError } from "@/utils/error";
import { executeClientSideAction } from "@/utils/executeClientSideActions";
import { getAnswerContent } from "@/utils/getAnswerContent";
import { migrateLegacyChatChunks } from "@/utils/migrateLegacyChatChunks";
import { persist } from "@/utils/persist";
import { setGeneralBackground } from "@/utils/setCssVariablesValue";
import { toaster } from "@/utils/toaster";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
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
  Index,
  Show,
  createEffect,
  createMemo,
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
  const botContainer = useBotContainer();
  const [chatChunks, setChatChunks] = persist(
    createSignal<ChatChunkType[]>([
      {
        version: "2",
        input: props.initialChatReply.input,
        messages: props.initialChatReply.messages,
        clientSideActions: props.initialChatReply.clientSideActions,
        dynamicTheme: props.initialChatReply.dynamicTheme,
      },
    ]),
    {
      key: `typebot-${props.context.typebot.id}-chatChunks`,
      storage: props.context.storage,
      transformInitDataFromStorage: (data) =>
        migrateLegacyChatChunks(data, {
          storage: props.context.storage,
          typebotId: props.context.typebot.id,
        }),
      onRecovered: () => {
        setTimeout(() => {
          chatContainer?.scrollTo(0, chatContainer.scrollHeight);
        }, 200);
      },
    },
  );
  const [isReadyToShowFirstChunk, setIsReadyToShowFirstChunk] =
    createSignal(false);

  const [isEnded, setIsEnded] = persist(createSignal(false), {
    key: `typebot-${props.context.typebot.id}-isEnded`,
    storage: props.context.storage,
  });
  const [isSending, setIsSending] = createSignal(false);
  const [isLastAutoScrollAtBottom, setIsLastAutoScrollAtBottom] =
    createSignal(true);
  const [hasError, setHasError] = createSignal(false);

  onMount(() => {
    window.addEventListener("message", processIncomingEvent);
    (async () => {
      const isRecoveredFromStorage = chatChunks().length > 1;
      if (isRecoveredFromStorage) {
        cleanupRecoveredChat();
        const lastDynamicThemeWithBg = chatChunks().findLast(
          (chunk) => chunk.dynamicTheme?.backgroundUrl,
        )?.dynamicTheme;
        if (lastDynamicThemeWithBg?.backgroundUrl)
          updateBgImage(
            lastDynamicThemeWithBg.backgroundUrl,
            botContainer()?.style,
          );
        // Most likely refreshed when the answer was sent to server
        if (chatChunks().at(-1)?.input?.answer)
          sendMessage(chatChunks().at(-1)?.input?.answer);
      } else {
        const actionsBeforeFirstBubble =
          props.initialChatReply.clientSideActions?.filter((action) =>
            isNotDefined(action.lastBubbleBlockId),
          );
        if (actionsBeforeFirstBubble && actionsBeforeFirstBubble.length > 0)
          await processClientSideActions(actionsBeforeFirstBubble);
      }
      setIsReadyToShowFirstChunk(true);
    })();
  });

  const cleanupRecoveredChat = () => {
    // Remove aborted streaming message
    if (chatChunks().at(-1)?.streamingMessage)
      setChatChunks((chunks) => chunks.slice(0, -1));
    const actionsBeforeFirstBubble = getNextClientSideActionsBatch({
      clientSideActions: chatChunks().at(-1)?.clientSideActions ?? [],
      lastBubbleBlockId: undefined,
    });
    if (actionsBeforeFirstBubble.length > 0)
      setChatChunks(
        sliceLastChunkClientSideAction(actionsBeforeFirstBubble.length),
      );
  };

  const streamMessage = ({ message }: { message: string }) => {
    setIsSending(false);
    setIsLastAutoScrollAtBottom(false);
    if (chatChunks().at(-1)?.streamingMessage) {
      setChatChunks((chunks) =>
        chunks.map((chunk, i) =>
          i === chunks.length - 1
            ? { ...chunk, messages: [], streamingMessage: message }
            : chunk,
        ),
      );
    } else {
      setChatChunks((chunks) => [
        ...chunks,
        {
          version: "2",
          messages: [],
          streamingMessage: message,
        },
      ]);
    }
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

  const sendMessage = async (
    answer?: InputSubmitContent | ClientSideResult,
  ) => {
    if (answer && answer.type !== "clientSideResult")
      setChatChunks(addAnswerToLastChunk(answer));
    const currentChunk = chatChunks().at(-1);
    if (hasError() && (currentChunk?.clientSideActions ?? []).length > 0) {
      setHasError(false);
      await processClientSideActions(currentChunk!.clientSideActions!);
      return;
    }
    setHasError(false);

    if (
      currentChunk?.input?.id &&
      answer &&
      answer.type !== "clientSideResult"
    ) {
      if (props.onAnswer)
        props.onAnswer({
          message: getAnswerContent(answer),
          blockId: currentChunk.input.id,
        });
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
    if (data.lastMessageNewFormat)
      setChatChunks(updateAnswerOnLastChunk(data.lastMessageNewFormat));
    if (data.logs) props.onNewLogs?.(data.logs);
    if (data.dynamicTheme?.backgroundUrl)
      updateBgImage(data.dynamicTheme.backgroundUrl, botContainer()?.style);
    if (data.input && props.onNewInputBlock) {
      props.onNewInputBlock(data.input);
    }
    if (data.clientSideActions) {
      const actionsBeforeFirstBubble = getNextClientSideActionsBatch({
        clientSideActions: data.clientSideActions,
        lastBubbleBlockId: undefined,
      });
      await processClientSideActions(actionsBeforeFirstBubble);
      if (
        data.clientSideActions.length > 0 &&
        data.messages.length === 0 &&
        data.input === undefined
      )
        return;
    }
    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        version: "2",
        clientSideActions: data.clientSideActions,
        input: data.input,
        dynamicTheme: data.dynamicTheme,
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
    const lastChunk = chatChunks().at(-1);
    if (!lastChunk) return;
    if (isNotDefined(lastChunk.input)) {
      setIsEnded(true);
      props.onEnd?.();
    }
  };

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const actionsToExecute = getNextClientSideActionsBatch({
      clientSideActions: chatChunks().at(-1)?.clientSideActions ?? [],
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
        if (response && "replyToSend" in response && !response.replyToSend) {
          setIsSending(false);
          continue;
        }
      }
      if (hasStreamError) return;

      setChatChunks(sliceLastChunkClientSideAction(1));
      if (response && "logs" in response) saveLogs(response.logs);
      if (response && "replyToSend" in response) {
        setIsSending(false);
        sendMessage(
          response.replyToSend
            ? { type: "clientSideResult", result: response.replyToSend }
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
    const currentInputBlock = chatChunks().at(-1)?.input;
    if (currentInputBlock?.id && data)
      setChatChunks(updateIsInputHiddenOnLastChunk);
    return processContinueChatResponse({ data, error });
  };

  const handleSkip = (label: string) => {
    setChatChunks(addAnswerToLastChunk({ type: "text", value: label }));
    sendMessage(undefined);
  };

  const latestTheme = createMemo(() =>
    mergeThemes(
      props.initialChatReply.typebot.theme,
      chatChunks().findLast((chunk) => chunk.dynamicTheme)?.dynamicTheme,
    ),
  );

  const chatContainerSize = createChatContainerProviderValue(
    () => chatContainer,
  );

  return (
    <ChatContainerSizeContext.Provider value={chatContainerSize}>
      <div
        ref={chatContainer}
        class={cx(
          "@container overflow-y-auto relative scrollable-container typebot-chat-view scroll-smooth w-full min-h-full flex flex-col items-center @xs:min-h-chat-container @xs:max-h-chat-container @xs:rounded-chat-container max-w-chat-container pt-5",
        )}
      >
        <div class="w-full flex flex-col gap-2 @xs:px-5 px-3">
          <Show when={isReadyToShowFirstChunk()}>
            <Index each={chatChunks()}>
              {(chunk, index) => (
                <ChatChunk
                  index={index}
                  messages={chunk().messages}
                  input={chunk().input}
                  theme={mergeThemes(
                    props.initialChatReply.typebot.theme,
                    chunk().dynamicTheme,
                  )}
                  settings={props.initialChatReply.typebot.settings}
                  context={props.context}
                  hideAvatar={
                    (!chunk().input || Boolean(chunk().input?.isHidden)) &&
                    ((chatChunks()[index + 1]?.messages ?? []).length > 0 ||
                      chatChunks()[index + 1]?.streamingMessage !== undefined ||
                      (chunk().messages.length > 0 && isSending()))
                  }
                  hasError={hasError() && index === chatChunks().length - 1}
                  isTransitionDisabled={index !== chatChunks().length - 1}
                  streamingMessage={chunk().streamingMessage}
                  onNewBubbleDisplayed={handleNewBubbleDisplayed}
                  onAllBubblesDisplayed={handleAllBubblesDisplayed}
                  onSubmit={sendMessage}
                  onScrollToBottom={autoScrollToBottom}
                  onSkip={handleSkip}
                />
              )}
            </Index>
          </Show>
          <Show when={isSending()}>
            <LoadingChunk theme={latestTheme()} />
          </Show>
        </div>

        <BottomSpacer />
      </div>
    </ChatContainerSizeContext.Provider>
  );
};

// Needed because we need to simulate a bottom padding relative to the chat view height
const BottomSpacer = () => (
  <div class="w-full flex-shrink-0 typebot-bottom-spacer h-5" />
);

const convertSubmitContentToMessage = (
  answer: InputSubmitContent | ClientSideResult | undefined,
): Message | undefined => {
  if (!answer) return;
  if (answer.type === "clientSideResult")
    return {
      type: "text",
      text: answer.result,
    };
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

const updateIsInputHiddenOnLastChunk = (
  chunks: ChatChunkType[],
): ChatChunkType[] => {
  const lastChunk = chunks[chunks.length - 1];
  if (!lastChunk || !lastChunk.input || lastChunk.input.answer) return chunks;
  return chunks.map((chunk, i) =>
    i === chunks.length - 1
      ? { ...chunk, input: { ...chunk.input!, isHidden: true } }
      : chunk,
  );
};

const updateAnswerOnLastChunk =
  (formattedMessage: string) =>
  (chunks: ChatChunkType[]): ChatChunkType[] => {
    const lastChunk = chunks[chunks.length - 1];
    if (
      !lastChunk ||
      !lastChunk.input ||
      !lastChunk.input.answer ||
      lastChunk.input.answer.type === "recording"
    )
      return chunks;
    if (lastChunk.input.answer?.type === "text" && lastChunk.input.answer.label)
      return chunks;

    if (lastChunk.input.type !== InputBlockType.FILE)
      return chunks.map((chunk, i) =>
        i === chunks.length - 1
          ? {
              ...chunk,
              input: {
                ...chunk.input!,
                answer: { ...chunk.input!.answer!, label: formattedMessage },
              },
            }
          : chunk,
      );

    return chunks;
  };

const addAnswerToLastChunk =
  (answer: NonNullable<NonNullable<ChatChunkType["input"]>["answer"]>) =>
  (chunks: ChatChunkType[]): ChatChunkType[] => {
    const lastChunk = chunks[chunks.length - 1];
    if (!lastChunk || !lastChunk.input) return chunks;
    return chunks.map((chunk, i) =>
      i === chunks.length - 1
        ? { ...chunk, input: { ...chunk.input!, answer } }
        : chunk,
    );
  };

const sliceLastChunkClientSideAction =
  (start: number) =>
  (chunks: ChatChunkType[]): ChatChunkType[] => {
    const lastChunk = chunks[chunks.length - 1];
    if (!lastChunk || !lastChunk.clientSideActions) return chunks;
    return chunks.map((chunk, i) =>
      i === chunks.length - 1
        ? { ...chunk, clientSideActions: chunk.clientSideActions!.slice(start) }
        : chunk,
    );
  };

const updateBgImage = (
  url: string,
  botContainerStyle: CSSStyleDeclaration | undefined,
) => {
  setGeneralBackground({
    background: {
      type: BackgroundType.IMAGE,
      content: url,
    },
    documentStyle: botContainerStyle ?? document.documentElement.style,
    typebotVersion: latestTypebotVersion,
  });
};
