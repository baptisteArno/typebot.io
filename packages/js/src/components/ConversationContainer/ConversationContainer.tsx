import type { ChatReply, Theme } from 'models'
import { createEffect, createSignal, For } from 'solid-js'
import { sendMessageQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import { BotContext, InitialChatReply } from '@/types'
import { executeIntegrations } from '@/utils/executeIntegrations'
import { executeLogic } from '@/utils/executeLogic'

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
  onNewLogs?: (logs: ChatReply['logs']) => void
}

export const ConversationContainer = (props: Props) => {
  let chatContainer: HTMLDivElement | undefined
  let bottomSpacer: HTMLDivElement | undefined
  const [chatChunks, setChatChunks] = createSignal<ChatReply[]>([
    {
      input: props.initialChatReply.input,
      messages: props.initialChatReply.messages,
    },
  ])
  const [dynamicTheme, setDynamicTheme] = createSignal<
    ChatReply['dynamicTheme']
  >(props.initialChatReply.dynamicTheme)
  const [theme, setTheme] = createSignal(props.initialChatReply.typebot.theme)

  createEffect(() => {
    setTheme(
      parseDynamicTheme(props.initialChatReply.typebot.theme, dynamicTheme())
    )
  })

  const sendMessage = async (message: string) => {
    const currentBlockId = chatChunks().at(-1)?.input?.id
    if (currentBlockId && props.onAnswer)
      props.onAnswer({ message, blockId: currentBlockId })
    const data = await sendMessageQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message,
    })
    if (!data) return
    if (data.logs) props.onNewLogs?.(data.logs)
    if (data.dynamicTheme) setDynamicTheme(data.dynamicTheme)
    if (data.input?.id && props.onNewInputBlock) {
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    }
    if (data.integrations) {
      executeIntegrations(data.integrations)
    }
    if (data.logic) {
      await executeLogic(data.logic)
    }
    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: data.messages,
      },
    ])
  }

  const autoScrollToBottom = () => {
    if (!bottomSpacer) return
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight)
    }, 50)
  }

  return (
    <div
      ref={chatContainer}
      class="overflow-y-scroll w-full min-h-full rounded px-3 pt-10 relative scrollable-container typebot-chat-view scroll-smooth"
    >
      <For each={chatChunks()}>
        {(chatChunk, index) => (
          <ChatChunk
            inputIndex={index()}
            messages={chatChunk.messages}
            input={chatChunk.input}
            theme={theme()}
            settings={props.initialChatReply.typebot.settings}
            onSubmit={sendMessage}
            onScrollToBottom={autoScrollToBottom}
            onSkip={() => {
              // TODO: implement skip
            }}
            onEnd={props.onEnd}
            context={props.context}
          />
        )}
      </For>
      <BottomSpacer ref={bottomSpacer} />
    </div>
  )
}

type BottomSpacerProps = {
  ref: HTMLDivElement | undefined
}
const BottomSpacer = (props: BottomSpacerProps) => {
  return <div ref={props.ref} class="w-full h-32" />
}
