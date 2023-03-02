import { TypingBubble } from '@/components'
import type { ImageBubbleContent } from 'models'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  url: ImageBubbleContent['url']
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const mediaLoadingFallbackTimeout = 5000

let typingTimeout: NodeJS.Timeout

export const ImageBubble = (props: Props) => {
  let image: HTMLImageElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd()
    }, showAnimationDuration)
  }

  onMount(() => {
    if (!image) return
    typingTimeout = setTimeout(onTypingEnd, mediaLoadingFallbackTimeout)
    image.onload = () => {
      clearTimeout(typingTimeout)
      onTypingEnd()
    }
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col animate-fade-in">
      <div class="flex mb-2 w-full lg:w-11/12 items-center">
        <div class={'flex relative z-10 items-start typebot-host-bubble'}>
          <div
            class="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() ? <TypingBubble /> : null}
          </div>
          <figure class="p-4 z-10">
            <img
              ref={image}
              src={props.url}
              class={
                'text-fade-in w-auto rounded-md max-w-full ' +
                (isTyping() ? 'opacity-0' : 'opacity-100')
              }
              style={{
                'max-height': '512px',
                height: isTyping() ? '32px' : 'auto',
              }}
              alt="Bubble image"
            />
          </figure>
        </div>
      </div>
    </div>
  )
}
