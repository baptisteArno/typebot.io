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
  hasError: boolean
  hideAvatar: boolean
  onNewBubbleDisplayed: (blockId: string) => Promise<void>
  onScrollToBottom: (top?: number) => void
  onSubmit: (input: string) => void
  onSkip: () => void
  onAllBubblesDisplayed: () => void
}

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(0)

  onMount(() => {
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed()
    }
    props.onScrollToBottom(
      inputRef?.offsetTop ? inputRef?.offsetTop - 50 : undefined
    )
  })

  const displayNextMessage = async (bubbleOffsetTop?: number) => {
    const lastBubbleBlockId = props.messages[displayedMessageIndex()].id
    await props.onNewBubbleDisplayed(lastBubbleBlockId)
    setDisplayedMessageIndex(
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1
    )
    props.onScrollToBottom(bubbleOffsetTop)
    if (displayedMessageIndex() === props.messages.length) {
      props.onAllBubblesDisplayed()
    }
  }

  return (
    <div class="flex flex-col w-full min-w-0 gap-2">
      <Show when={props.messages.length > 0}>
        <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
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
            class="flex flex-col flex-1 gap-2"
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
      </Show>
      {props.input && displayedMessageIndex() === props.messages.length && (
        <InputChatBlock
          ref={inputRef}
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
  )
}
