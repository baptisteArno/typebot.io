import { TypingBubble } from '@/components/bubbles/TypingBubble'
import { EmbedBubbleContent } from 'models'
import { createSignal, onMount } from 'solid-js'

type Props = {
  content: EmbedBubbleContent
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const EmbedBubble = (props: Props) => {
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        props.onTransitionEnd()
      }, showAnimationDuration)
    }, 1000)
  })

  return (
    <div class="flex flex-col w-full animate-fade-in">
      <div class="flex mb-2 w-full lg:w-11/12 items-center">
        <div
          class={'flex relative z-10 items-start typebot-host-bubble w-full'}
        >
          <div
            class="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping() ? '4rem' : '100%',
              height: isTyping() ? '2rem' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <iframe
            id="embed-bubble-content"
            src={props.content.url}
            class={
              'w-full z-20 p-4 text-fade-in rounded-2xl ' +
              (isTyping() ? 'opacity-0' : 'opacity-100')
            }
            style={{
              height: isTyping() ? '2rem' : `${props.content.height}px`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
