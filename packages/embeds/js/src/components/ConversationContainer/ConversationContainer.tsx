import { ChatReply, SendMessageInput, Theme } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/enums'
import {
  createEffect,
  createSignal,
  createUniqueId,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { sendMessageQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import {
  BotContext,
  ChatChunk as ChatChunkType,
  InitialChatReply,
  OutgoingLog,
} from '@/types'
import { isNotDefined } from '@typebot.io/lib'
import { executeClientSideAction } from '@/utils/executeClientSideActions'
import { LoadingChunk } from './LoadingChunk'
import { PopupBlockedToast } from './PopupBlockedToast'
import { setStreamingMessage } from '@/utils/streamingMessageSignal'
import {
  formattedMessages,
  setFormattedMessages,
} from '@/utils/formattedMessagesSignal'

const parseDynamicTheme = (
  initialTheme: Theme,
  dynamicTheme: ChatReply['dynamicTheme']
): Theme => ({
  ...initialTheme,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
            ...initialTheme.chat.hostAvatar,
            url: dynamicTheme.hostAvatarUrl,
          }
        : initialTheme.chat.hostAvatar,
    guestAvatar:
      initialTheme.chat.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
            ...initialTheme.chat.guestAvatar,
            url: dynamicTheme?.guestAvatarUrl,
          }
        : initialTheme.chat.guestAvatar,
  },
})

type Props = {
  initialChatReply: InitialChatReply
  context: BotContext
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined
  const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>([
    {
      input: props.initialChatReply.input,
      messages: props.initialChatReply.messages,
      clientSideActions: props.initialChatReply.clientSideActions,
    },
  ])
  const [dynamicTheme, setDynamicTheme] = createSignal<
    ChatReply['dynamicTheme']
  >(props.initialChatReply.dynamicTheme)
  const [theme, setTheme] = createSignal(props.initialChatReply.typebot.theme)
  const [isSending, setIsSending] = createSignal(false)
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>()
  const [hasError, setHasError] = createSignal(false)

  onMount(() => {
    ;(async () => {
      const initialChunk = chatChunks()[0]
      if (initialChunk.clientSideActions) {
        const actionsBeforeFirstBubble = initialChunk.clientSideActions.filter(
          (action) => isNotDefined(action.lastBubbleBlockId)
        )
        for (const action of actionsBeforeFirstBubble) {
          if (
            'streamOpenAiChatCompletion' in action ||
            'webhookToExecute' in action
          )
            setIsSending(true)
          const response = await executeClientSideAction({
            clientSideAction: action,
            context: {
              apiHost: props.context.apiHost,
              sessionId: props.initialChatReply.sessionId,
            },
            onMessageStream: streamMessage,
          })
          if (response && 'replyToSend' in response) {
            sendMessage(response.replyToSend, response.logs)
            return
          }
          if (response && 'blockedPopupUrl' in response)
            setBlockedPopupUrl(response.blockedPopupUrl)
        }
      }
    })()
  })

  const streamMessage = (content: string) => {
    setIsSending(false)
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    const id = lastChunk.streamingMessageId ?? createUniqueId()
    if (!lastChunk.streamingMessageId)
      setChatChunks((displayedChunks) => [
        ...displayedChunks,
        {
          messages: [],
          streamingMessageId: id,
        },
      ])
    setStreamingMessage({ id, content })
  }

  createEffect(() => {
    setTheme(
      parseDynamicTheme(props.initialChatReply.typebot.theme, dynamicTheme())
    )
  })

  const sendMessage = async (
    message: string | undefined,
    clientLogs?: SendMessageInput['clientLogs']
  ) => {
    if (clientLogs) props.onNewLogs?.(clientLogs)
    setHasError(false)
    const currentInputBlock = [...chatChunks()].pop()?.input
    if (currentInputBlock?.id && props.onAnswer && message)
      props.onAnswer({ message, blockId: currentInputBlock.id })
    if (currentInputBlock?.type === InputBlockType.FILE)
      props.onNewLogs?.([
        {
          description: 'Files are not uploaded in preview mode',
          status: 'info',
        },
      ])
    const longRequest = setTimeout(() => {
      setIsSending(true)
    }, 1000)
    const { data, error } = await sendMessageQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message,
      clientLogs,
    })
    clearTimeout(longRequest)
    setIsSending(false)
    if (error) {
      setHasError(true)
      props.onNewLogs?.([
        {
          description: 'Failed to send the reply',
          details: error,
          status: 'error',
        },
      ])
    }
    if (!data) return
    if (data.lastMessageNewFormat) {
      setFormattedMessages([
        ...formattedMessages(),
        {
          inputId: [...chatChunks()].pop()?.input?.id ?? '',
          formattedMessage: data.lastMessageNewFormat as string,
        },
      ])
    }
    if (data.logs) props.onNewLogs?.(data.logs)
    if (data.dynamicTheme) setDynamicTheme(data.dynamicTheme)
    if (data.input?.id && props.onNewInputBlock) {
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    }
    if (data.clientSideActions) {
      const actionsBeforeFirstBubble = data.clientSideActions.filter((action) =>
        isNotDefined(action.lastBubbleBlockId)
      )
      for (const action of actionsBeforeFirstBubble) {
        if (
          'streamOpenAiChatCompletion' in action ||
          'webhookToExecute' in action
        )
          setIsSending(true)
        const response = await executeClientSideAction({
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.initialChatReply.sessionId,
          },
          onMessageStream: streamMessage,
        })
        if (response && 'replyToSend' in response) {
          sendMessage(response.replyToSend, response.logs)
          return
        }
        if (response && 'blockedPopupUrl' in response)
          setBlockedPopupUrl(response.blockedPopupUrl)
      }
    }
    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: [...chatChunks()].pop()?.streamingMessageId
          ? data.messages.slice(1)
          : data.messages,
        clientSideActions: data.clientSideActions,
      },
    ])
  }

  const autoScrollToBottom = (offsetTop?: number) => {
    const chunks = chatChunks()
    const lastChunkWasStreaming =
      chunks.length >= 2 && chunks[chunks.length - 2].streamingMessageId
    if (lastChunkWasStreaming) return
    setTimeout(() => {
      chatContainer?.scrollTo(0, offsetTop ?? chatContainer.scrollHeight)
    }, 50)
  }

  const handleAllBubblesDisplayed = async () => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (isNotDefined(lastChunk.input)) {
      props.onEnd?.()
    }
  }

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (lastChunk.clientSideActions) {
      const actionsToExecute = lastChunk.clientSideActions.filter(
        (action) => action.lastBubbleBlockId === blockId
      )
      for (const action of actionsToExecute) {
        if (
          'streamOpenAiChatCompletion' in action ||
          'webhookToExecute' in action
        )
          setIsSending(true)
        const response = await executeClientSideAction({
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.initialChatReply.sessionId,
          },
          onMessageStream: streamMessage,
        })
        if (response && 'replyToSend' in response) {
          sendMessage(response.replyToSend, response.logs)
          return
        }
        if (response && 'blockedPopupUrl' in response)
          setBlockedPopupUrl(response.blockedPopupUrl)
      }
    }
  }

  onCleanup(() => {
    setStreamingMessage(undefined)
    setFormattedMessages([])
  })

  const handleSkip = () => sendMessage(undefined)

  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container typebot-chat-view scroll-smooth gap-2"
    >
      <For each={chatChunks()}>
        {(chatChunk, index) => (
          <ChatChunk
            inputIndex={index()}
            messages={chatChunk.messages}
            input={chatChunk.input}
            theme={theme()}
            settings={props.initialChatReply.typebot.settings}
            streamingMessageId={chatChunk.streamingMessageId}
            context={props.context}
            hideAvatar={
              !chatChunk.input &&
              !chatChunk.streamingMessageId &&
              index() < chatChunks().length - 1
            }
            hasError={hasError() && index() === chatChunks().length - 1}
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
      <Show when={blockedPopupUrl()} keyed>
        {(blockedPopupUrl) => (
          <div class="flex justify-end">
            <PopupBlockedToast
              url={blockedPopupUrl}
              onLinkClick={() => setBlockedPopupUrl(undefined)}
            />
          </div>
        )}
      </Show>
      <BottomSpacer />
    </div>
  )
}

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />
}
