import { ChatReply, Theme } from 'models'
import { createSignal, For } from 'solid-js'
import { sendMessageQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import { BotContext, InitialChatReply } from '@/types'
import { executeIntegrations } from '@/utils/executeIntegrations'
import { executeLogic } from '@/utils/executeLogic'

const parseDynamicTheme = (
  theme: Theme,
  dynamicTheme: ChatReply['dynamicTheme']
): Theme => ({
  ...theme,
  chat: {
    ...theme.chat,
    hostAvatar: theme.chat.hostAvatar
      ? {
          ...theme.chat.hostAvatar,
          url: dynamicTheme?.hostAvatarUrl,
        }
      : undefined,
    guestAvatar: theme.chat.guestAvatar
      ? {
          ...theme.chat.guestAvatar,
          url: dynamicTheme?.guestAvatarUrl,
        }
      : undefined,
  },
})

type Props = {
  initialChatReply: InitialChatReply
  context: BotContext
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
}

export const ConversationContainer = (props: Props) => {
  let bottomSpacer: HTMLDivElement | undefined
  const [chatChunks, setChatChunks] = createSignal<ChatReply[]>([
    {
      input: props.initialChatReply.input,
      messages: props.initialChatReply.messages,
    },
  ])
  const [theme, setTheme] = createSignal(
    parseDynamicTheme(
      props.initialChatReply.typebot.theme,
      props.initialChatReply.dynamicTheme
    )
  )

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
    if (data.dynamicTheme) applyDynamicTheme(data.dynamicTheme)
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

  const applyDynamicTheme = (dynamicTheme: ChatReply['dynamicTheme']) => {
    setTheme((theme) => parseDynamicTheme(theme, dynamicTheme))
  }

  const autoScrollToBottom = () => {
    if (!bottomSpacer) return
    setTimeout(() => {
      bottomSpacer?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  return (
    <div class="overflow-y-scroll w-full min-h-full rounded px-3 pt-10 relative scrollable-container typebot-chat-view">
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
