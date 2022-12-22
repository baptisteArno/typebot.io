import { BotContext } from '@/types'
import { ChatReply, Settings, Theme } from 'models'
import { createSignal, For, Show } from 'solid-js'
import { HostBubble } from '../bubbles/HostBubble'
import { InputChatBlock } from '../InputChatBlock'
import { AvatarSideContainer } from './AvatarSideContainer'

type Props = Pick<ChatReply, 'messages' | 'input'> & {
  theme: Theme
  settings: Settings
  inputIndex: number
  context: BotContext
  onSubmit: (input: string) => void
  onSkip: () => void
}

export const ChatChunk = (props: Props) => {
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(0)

  const displayNextMessage = () => {
    setDisplayedMessageIndex(
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1
    )
  }

  return (
    <div class="flex w-full">
      <div class="flex flex-col w-full min-w-0">
        <div class="flex">
          <Show
            when={
              props.theme.chat.hostAvatar?.isEnabled &&
              props.messages.length > 0
            }
          >
            <AvatarSideContainer
              hostAvatarSrc={props.theme.chat.hostAvatar?.url}
            />
          </Show>
          <div
            class="flex-1"
            style={{
              'margin-right': props.theme.chat.guestAvatar?.isEnabled
                ? '50px'
                : '0.5rem',
            }}
          >
            <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
              {(message) => (
                <HostBubble
                  message={message}
                  onTransitionEnd={displayNextMessage}
                />
              )}
            </For>
          </div>
        </div>
        {props.input && displayedMessageIndex() === props.messages.length && (
          <InputChatBlock
            block={props.input}
            inputIndex={props.inputIndex}
            onSubmit={props.onSubmit}
            onSkip={props.onSkip}
            guestAvatar={props.theme.chat.guestAvatar}
            context={props.context}
          />
        )}
      </div>
    </div>
  )
}
