import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import type { EmbedBubbleContent } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { clsx } from 'clsx'

type Props = {
  content: EmbedBubbleContent
  onTransitionEnd: (offsetTop?: number) => void
}

let typingTimeout: NodeJS.Timeout

export const showAnimationDuration = 400

export const EmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        props.onTransitionEnd(ref?.offsetTop)
      }, showAnimationDuration)
    }, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col w-full animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
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
          <div
            class={clsx(
              'p-4 z-20 text-fade-in w-full',
              isTyping() ? 'opacity-0' : 'opacity-100 p-4'
            )}
            style={{
              height: isTyping()
                ? isMobile()
                  ? '32px'
                  : '36px'
                : `${props.content.height}px`,
            }}
          >
            <iframe
              id="embed-bubble-content"
              src={props.content.url}
              class={'w-full h-full '}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
