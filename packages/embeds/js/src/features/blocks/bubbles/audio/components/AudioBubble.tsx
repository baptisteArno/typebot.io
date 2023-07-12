import { TypingBubble } from '@/components'
import type { AudioBubbleContent } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  url: AudioBubbleContent['url']
  onTransitionEnd: (offsetTop?: number) => void
}

const showAnimationDuration = 400
const typingDuration = 500

let typingTimeout: NodeJS.Timeout

export const AudioBubble = (props: Props) => {
  let isPlayed = false
  let ref: HTMLDivElement | undefined
  let audioElement: HTMLAudioElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  const endTyping = () => {
    if (isPlayed) return
    isPlayed = true
    setIsTyping(false)
    setTimeout(
      () => props.onTransitionEnd(ref?.offsetTop),
      showAnimationDuration
    )
  }

  onMount(() => {
    typingTimeout = setTimeout(endTyping, typingDuration)
    audioElement?.addEventListener(
      'canplay',
      () => {
        clearTimeout(typingTimeout)
        audioElement
          ?.play()
          .catch((e) => console.warn("Couldn't autoplay audio", e))
        endTyping()
      },
      { once: true }
    )
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
        <div class={'flex relative z-10 items-start typebot-host-bubble'}>
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <audio
            ref={audioElement}
            src={props.url}
            class={
              'z-10 text-fade-in m-2 ' +
              (isTyping() ? 'opacity-0' : 'opacity-100')
            }
            style={{ height: isTyping() ? '32px' : 'revert' }}
            controls
          />
        </div>
      </div>
    </div>
  )
}
