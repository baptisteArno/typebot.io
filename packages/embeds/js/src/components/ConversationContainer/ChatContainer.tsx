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

export const ChatContainer = (props: Props) => {
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
          getScrollContainer()?.scrollTo(0, getScrollContainer()!.scrollHeight);
        }, 200);
      },
    },
  );

  const [isEnded, setIsEnded] = persist(createSignal(false), {
    key: `typebot-${props.context.typebot.id}-isEnded`,
    storage: props.context.storage,
  });
  const [isSending, setIsSending] = createSignal(false);
  const [isLastAutoScrollAtBottom, setIsLastAutoScrollAtBottom] =
    createSignal(true);

  onMount(() => {
    window.addEventListener("message", processIncomingEvent);
    (async () => {
      const isRecoveredFromStorage = chatChunks().length > 1;
      if (isRecoveredFromStorage) {
        cleanupRecoveredChatChunks();
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
      }
      await popClientSideActions();
    })();
  });

  const getScrollContainer = () =>
    botContainer()?.querySelector(".scrollable-container");

  const cleanupRecoveredChatChunks = () => {
    // Remove aborted streaming message
    if (chatChunks().at(-1)?.streamingMessage)
      setChatChunks((chunks) => chunks.slice(0, -1));
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
    const currentChunk = chatChunks().at(-1);
    if (answer && answer.type !== "clientSideResult")
      setChatChunks(addAnswerToLastChunk(answer));
    // Most likely had stream error, user just sent the same message back, we need to execute the stream client action again
    if (
      currentChunk?.clientSideActions &&
      currentChunk.clientSideActions.length > 0 &&
      currentChunk.input?.answer?.status === "retry"
    ) {
      await popClientSideActions();
      return;
    }

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
  };

  const processContinueChatResponse = async ({
    data,
    error,
  }: { data: ContinueChatResponse | undefined; error: unknown }) => {
    if (error) {
      if (isNetworkError(error)) showOfflineErrorToast();
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
    setChatChunks(addNewChunk(data));
    await popClientSideActions();
  };

  const autoScrollToBottom = ({
    lastElement,
    offset = 0,
  }: { lastElement?: HTMLDivElement; offset?: number } = {}) => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const isBottomOfLastElementTooFarBelow =
      scrollContainer.scrollTop + scrollContainer.clientHeight <
      scrollContainer.scrollHeight -
        scrollContainer.clientHeight *
          AUTO_SCROLL_CLIENT_HEIGHT_PERCENT_TOLERANCE;

    if (isBottomOfLastElementTooFarBelow && !isLastAutoScrollAtBottom()) return;

    const onScrollEnd = (callback: () => void) => {
      let scrollTimeout: number;

      const scrollListener = () => {
        clearTimeout(scrollTimeout);

        scrollTimeout = window.setTimeout(() => {
          callback();
          scrollContainer?.removeEventListener("scroll", scrollListener);
        }, 100);
      };

      scrollContainer?.addEventListener("scroll", scrollListener, {
        passive: true,
      });
    };

    setTimeout(() => {
      onScrollEnd(() => {
        if (!scrollContainer) return;
        const isAtBottom =
          Math.abs(
            scrollContainer.scrollHeight -
              scrollContainer.scrollTop -
              scrollContainer.clientHeight,
          ) < 2;
        setIsLastAutoScrollAtBottom(isAtBottom);
      });
      scrollContainer?.scrollTo({
        top: lastElement
          ? lastElement.offsetTop - offset
          : scrollContainer?.scrollHeight,
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
    await popClientSideActions(blockId);
  };

  /**
   * Executes current chat chunk client side actions (matching `lastBubbleBlockId`) and pop them from the queue one by one.
   */
  const popClientSideActions = async (lastBubbleBlockId?: string) => {
    let hasStreamError = false;
    const actionsToExecuteNow = [];
    for (const action of chatChunks().at(-1)?.clientSideActions ?? []) {
      if (lastBubbleBlockId !== action.lastBubbleBlockId) break;
      actionsToExecuteNow.push(action);
    }
    if (actionsToExecuteNow.length === 0) return;
    for (const action of actionsToExecuteNow) {
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
          setChatChunks(setRetryStatusOnLastAnswer);
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

      setChatChunks(popClientSideAction);
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

  const isChatContainerTransparent = createMemo(
    () =>
      (props.initialChatReply.typebot.theme.chat?.container?.backgroundColor ??
        defaultContainerBackgroundColor) === "transparent",
  );

  const filteredChunks = createMemo(() =>
    chatChunks().filter(hasExecutedInitialClientSideActions),
  );

  const hideAvatarFlags = createMemo(() => {
    const list = filteredChunks();
    const sending = isSending();
    return list.map((c, idx) => {
      const n = list[idx + 1];
      return (
        ((!c.input || c.input?.isHidden) &&
          ((n?.messages?.length ?? 0) > 0 ||
            n?.streamingMessage !== undefined ||
            (c.messages.length > 0 && sending))) ??
        false
      );
    });
  });

  return (
    <ChatContainerSizeContext.Provider value={chatContainerSize}>
      <div
        // Be extra careful when changing class names of the following containers, make sure to test scroll behavior on iOS devices.
        class={cx(
          "w-full h-full px-[calc((100%-var(--typebot-chat-container-max-width))/2)]",
          // If chat container is transparent, we make sure the scroll area takes the entire width of the container
          isChatContainerTransparent()
            ? "overflow-y-auto scroll-smooth scrollable-container"
            : // on mobile view, we want the chat container to be full height and start-aligned
              // flex needs to be set when the continaier is not scrollable (some iOS devices quirks)
              "@container flex @xs:items-center",
        )}
      >
        <div
          ref={chatContainer}
          class={cx(
            "@container relative typebot-chat-view w-full flex flex-col items-center pt-5 max-w-chat-container",
            isChatContainerTransparent()
              ? undefined
              : cx(
                  "overflow-y-auto scroll-smooth scrollable-container",
                  "@xs:min-h-chat-container max-h-full @xs:max-h-chat-container @xs:rounded-chat-container",
                ),
          )}
        >
          <div class="w-full flex flex-col gap-2 @xs:px-5 px-3">
            <Index each={filteredChunks()}>
              {(chunk, i) => (
                <ChatChunk
                  index={i}
                  messages={chunk().messages}
                  input={chunk().input}
                  theme={mergeThemes(
                    props.initialChatReply.typebot.theme,
                    chunk().dynamicTheme,
                  )}
                  settings={props.initialChatReply.typebot.settings}
                  context={props.context}
                  hideAvatar={hideAvatarFlags()[i]}
                  isTransitionDisabled={i !== filteredChunks().length - 1}
                  streamingMessage={chunk().streamingMessage}
                  onNewBubbleDisplayed={handleNewBubbleDisplayed}
                  onAllBubblesDisplayed={handleAllBubblesDisplayed}
                  onSubmit={sendMessage}
                  onScrollToBottom={autoScrollToBottom}
                  onSkip={handleSkip}
                />
              )}
            </Index>
            <Show when={isSending()}>
              <LoadingChunk theme={latestTheme()} />
            </Show>
          </div>
          <BottomSpacer />
        </div>
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

/**
 * Pop 1 client side action from the last chunk client side actions queue
 * If the chunk does not have messages, or input and no remaining actions are left, the chunk is removed.
 */
const popClientSideAction = (chunks: ChatChunkType[]): ChatChunkType[] => {
  const lastChunk = chunks[chunks.length - 1];
  if (!lastChunk || !lastChunk.clientSideActions) return chunks;
  return chunks.reduce<ChatChunkType[]>((acc, chunk, i) => {
    if (i === chunks.length - 1) {
      const remainingActions = chunk.clientSideActions!.slice(1);
      if (
        remainingActions.length === 0 &&
        chunk.messages.length === 0 &&
        !chunk.input
      )
        return acc;
      acc.push({ ...chunk, clientSideActions: remainingActions });
    } else {
      acc.push(chunk);
    }
    return acc;
  }, []);
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

const addNewChunk =
  (data: ContinueChatResponse) =>
  (chunks: ChatChunkType[]): ChatChunkType[] => {
    return [
      ...chunks,
      {
        version: "2",
        clientSideActions: data.clientSideActions,
        input: data.input,
        dynamicTheme: data.dynamicTheme,
        messages: sanitizeMessages(data.messages),
      },
    ];
  };

const sanitizeMessages = (messages: ContinueChatResponse["messages"]) => {
  return messages.filter((message) => {
    return (
      message.type !== "text" ||
      message.content.type !== "richText" ||
      message.content.richText.length > 1 ||
      message.content.richText[0].type !== "variable" ||
      message.content.richText[0].children.length > 0
    );
  });
};

const hasExecutedInitialClientSideActions = (chunk: ChatChunkType) => {
  return (
    !chunk.clientSideActions ||
    chunk.clientSideActions.every((action) => action.lastBubbleBlockId)
  );
};

const setRetryStatusOnLastAnswer = (
  chunks: ChatChunkType[],
): ChatChunkType[] => {
  const lastChunk = chunks[chunks.length - 1];
  if (!lastChunk || !lastChunk.input || !lastChunk.input.answer) return chunks;
  return chunks.map((chunk, i) =>
    i === chunks.length - 1
      ? {
          ...chunk,
          input: {
            ...chunk.input!,
            answer: { ...chunk.input!.answer!, status: "retry" },
          },
        }
      : chunk,
  );
};
