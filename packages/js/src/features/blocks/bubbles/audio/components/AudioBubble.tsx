import { TypingBubble } from '@/components/bubbles/TypingBubble'
import { AudioBubbleContent } from 'models'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  url: AudioBubbleContent['url']
  onTransitionEnd: () => void
}

const showAnimationDuration = 400
const typingDuration = 500

let typingTimeout: NodeJS.Timeout

export const AudioBubble = (props: Props) => {
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        props.onTransitionEnd()
      }, showAnimationDuration)
    }, typingDuration)
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
              width: isTyping() ? '4rem' : '100%',
              height: isTyping() ? '2rem' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <audio
            src={props.url}
            class={
              'z-10 text-fade-in m-2 ' +
              (isTyping() ? 'opacity-0' : 'opacity-100')
            }
            style={{ height: isTyping() ? '2rem' : 'revert' }}
            autoplay
            controls
          />
        </div>
      </div>
    </div>
  )
}
