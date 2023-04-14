import { BotContext } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChatReply, Settings, Theme } from '@typebot.io/schemas'
import { createSignal, For, onMount, Show } from 'solid-js'
import { HostBubble } from '../bubbles/HostBubble'
import { InputChatBlock } from '../InputChatBlock'
import { AvatarSideContainer } from './AvatarSideContainer'

type Props = Pick<ChatReply, 'messages' | 'input'> & {
  theme: Theme
  settings: Settings
  inputIndex: number
  context: BotContext
  isLoadingBubbleDisplayed: boolean
  hasError: boolean
  hideAvatar: boolean
  onNewBubbleDisplayed: (blockId: string) => Promise<void>
  onScrollToBottom: () => void
  onSubmit: (input: string) => void
  onSkip: () => void
  onAllBubblesDisplayed: () => void
}

export const ChatChunk = (props: Props) => {
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(0)

  onMount(() => {
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed()
    }
    props.onScrollToBottom()
  })

  const displayNextMessage = async () => {
    const lastBubbleBlockId = props.messages[displayedMessageIndex()].id
    await props.onNewBubbleDisplayed(lastBubbleBlockId)
    setDisplayedMessageIndex(
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1
    )
    props.onScrollToBottom()
    if (displayedMessageIndex() === props.messages.length) {
      props.onAllBubblesDisplayed()
    }
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
              hideAvatar={props.hideAvatar}
            />
          </Show>
          <div
            class="flex-1"
            style={{
              'margin-right': props.theme.chat.guestAvatar?.isEnabled
                ? isMobile()
                  ? '32px'
                  : '48px'
                : undefined,
            }}
          >
            <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
              {(message) => (
                <HostBubble
                  message={message}
                  typingEmulation={props.settings.typingEmulation}
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
            hasHostAvatar={props.theme.chat.hostAvatar?.isEnabled ?? false}
            guestAvatar={props.theme.chat.guestAvatar}
            context={props.context}
            isInputPrefillEnabled={
              props.settings.general.isInputPrefillEnabled ?? true
            }
            hasError={props.hasError}
          />
        )}
      </div>
    </div>
  )
}
