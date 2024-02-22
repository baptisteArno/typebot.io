import { BotContext, ChatChunk as ChatChunkType } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { ContinueChatResponse, Settings, Theme } from '@typebot.io/schemas'
import { createSignal, For, onMount, Show } from 'solid-js'
import { HostBubble } from '../bubbles/HostBubble'
import { InputChatBlock } from '../InputChatBlock'
import { AvatarSideContainer } from './AvatarSideContainer'
import { StreamingBubble } from '../bubbles/StreamingBubble'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'

type Props = Pick<ContinueChatResponse, 'messages' | 'input'> & {
  theme: Theme
  settings: Settings
  inputIndex: number
  context: BotContext
  hasError: boolean
  hideAvatar: boolean
  streamingMessageId: ChatChunkType['streamingMessageId']
  onNewBubbleDisplayed: (blockId: string) => Promise<void>
  onScrollToBottom: (top?: number) => void
  onSubmit: (input?: string) => void
  onSkip: () => void
  onAllBubblesDisplayed: () => void
}

export const ChatChunk = (props: Props) => {
  let inputRef: HTMLDivElement | undefined
  const [displayedMessageIndex, setDisplayedMessageIndex] = createSignal(0)
  const [lastBubbleOffsetTop, setLastBubbleOffsetTop] = createSignal<number>()

  onMount(() => {
    if (props.streamingMessageId) return
    if (props.messages.length === 0) {
      props.onAllBubblesDisplayed()
    }
    props.onScrollToBottom(
      inputRef?.offsetTop ? inputRef?.offsetTop - 50 : undefined
    )
  })

  const displayNextMessage = async (bubbleOffsetTop?: number) => {
    if (
      (props.settings.typingEmulation?.delayBetweenBubbles ??
        defaultSettings.typingEmulation.delayBetweenBubbles) > 0 &&
      displayedMessageIndex() < props.messages.length - 1
    ) {
      // eslint-disable-next-line solid/reactivity
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (props.settings.typingEmulation?.delayBetweenBubbles ??
            defaultSettings.typingEmulation.delayBetweenBubbles) * 1000
        )
      )
    }
    const lastBubbleBlockId = props.messages[displayedMessageIndex()].id
    await props.onNewBubbleDisplayed(lastBubbleBlockId)
    setDisplayedMessageIndex(
      displayedMessageIndex() === props.messages.length
        ? displayedMessageIndex()
        : displayedMessageIndex() + 1
    )
    props.onScrollToBottom(bubbleOffsetTop)
    if (displayedMessageIndex() === props.messages.length) {
      setLastBubbleOffsetTop(bubbleOffsetTop)
      props.onAllBubblesDisplayed()
    }
  }

  return (
    <div class="flex flex-col w-full min-w-0 gap-2">
      <Show when={props.messages.length > 0}>
        <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
          <Show
            when={
              (props.theme.chat?.hostAvatar?.isEnabled ??
                defaultTheme.chat.hostAvatar.isEnabled) &&
              props.messages.length > 0
            }
          >
            <AvatarSideContainer
              hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
              hideAvatar={props.hideAvatar}
            />
          </Show>

          <div
            class="flex flex-col flex-1 gap-2"
            style={{
              'max-width':
                props.theme.chat?.guestAvatar?.isEnabled ??
                defaultTheme.chat.guestAvatar.isEnabled
                  ? isMobile()
                    ? 'calc(100% - 32px - 32px)'
                    : 'calc(100% - 48px - 48px)'
                  : isMobile()
                  ? 'calc(100% - 32px)'
                  : 'calc(100% - 48px)',
            }}
          >
            <For each={props.messages.slice(0, displayedMessageIndex() + 1)}>
              {(message, idx) => (
                <HostBubble
                  message={message}
                  typingEmulation={props.settings.typingEmulation}
                  isTypingSkipped={
                    (props.settings.typingEmulation?.isDisabledOnFirstMessage ??
                      defaultSettings.typingEmulation
                        .isDisabledOnFirstMessage) &&
                    props.inputIndex === 0 &&
                    idx() === 0
                  }
                  onTransitionEnd={displayNextMessage}
                  onCompleted={props.onSubmit}
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
          hasHostAvatar={
            props.theme.chat?.hostAvatar?.isEnabled ??
            defaultTheme.chat.hostAvatar.isEnabled
          }
          guestAvatar={props.theme.chat?.guestAvatar}
          context={props.context}
          isInputPrefillEnabled={
            props.settings.general?.isInputPrefillEnabled ??
            defaultSettings.general.isInputPrefillEnabled
          }
          hasError={props.hasError}
          onTransitionEnd={() => props.onScrollToBottom(lastBubbleOffsetTop())}
          onSubmit={props.onSubmit}
          onSkip={props.onSkip}
        />
      )}
      <Show when={props.streamingMessageId} keyed>
        {(streamingMessageId) => (
          <div class={'flex' + (isMobile() ? ' gap-1' : ' gap-2')}>
            <Show
              when={
                props.theme.chat?.hostAvatar?.isEnabled ??
                defaultTheme.chat.hostAvatar.isEnabled
              }
            >
              <AvatarSideContainer
                hostAvatarSrc={props.theme.chat?.hostAvatar?.url}
                hideAvatar={props.hideAvatar}
              />
            </Show>

            <div
              class="flex flex-col flex-1 gap-2"
              style={{
                'max-width':
                  props.theme.chat?.hostAvatar?.isEnabled ??
                  defaultTheme.chat.hostAvatar.isEnabled
                    ? isMobile()
                      ? 'calc(100% - 32px - 32px)'
                      : 'calc(100% - 48px - 48px)'
                    : isMobile()
                    ? 'calc(100% - 32px)'
                    : 'calc(100% - 48px)',
              }}
            >
              <StreamingBubble streamingMessageId={streamingMessageId} />
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
