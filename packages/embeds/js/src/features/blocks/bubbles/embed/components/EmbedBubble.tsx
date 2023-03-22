import { TypingBubble } from '@/components'
import type { EmbedBubbleContent } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  content: EmbedBubbleContent
  onTransitionEnd: () => void
}

let typingTimeout: NodeJS.Timeout

export const showAnimationDuration = 400

export const EmbedBubble = (props: Props) => {
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        props.onTransitionEnd()
      }, showAnimationDuration)
    }, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col w-full animate-fade-in">
      <div class="flex mb-2 w-full items-center">
        <div
          class={'flex relative z-10 items-start typebot-host-bubble w-full'}
        >
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <iframe
            id="embed-bubble-content"
            src={props.content.url}
            class={
              'w-full z-20 p-4 text-fade-in ' +
              (isTyping() ? 'opacity-0' : 'opacity-100')
            }
            style={{
              height: isTyping() ? '32px' : `${props.content.height}px`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
