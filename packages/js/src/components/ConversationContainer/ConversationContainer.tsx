import { ChatReply, InitialChatReply } from 'models'
import { createSignal, For } from 'solid-js'
import { sendMessageQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import { BotContext } from '@/types'
import { executeIntegrations } from '@/utils/executeIntegrations'
import { executeLogic } from '@/utils/executeLogic'

type Props = {
  initialChatReply: InitialChatReply
  context: BotContext
}

export const ConversationContainer = (props: Props) => {
  const [chatChunks, setChatChunks] = createSignal<ChatReply[]>([
    {
      input: props.initialChatReply.input,
      messages: props.initialChatReply.messages,
    },
  ])

  const sendMessage = async (message: string) => {
    const data = await sendMessageQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message,
    })
    if (!data) return
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

  return (
    <div class="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view">
      <For each={chatChunks()}>
        {(chatChunk, index) => (
          <ChatChunk
            inputIndex={index()}
            messages={chatChunk.messages}
            input={chatChunk.input}
            theme={props.initialChatReply.typebot.theme}
            settings={props.initialChatReply.typebot.settings}
            onSubmit={sendMessage}
            onSkip={() => {
              // TODO: implement skip
            }}
            context={props.context}
          />
        )}
      </For>
    </div>
  )
}
