import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import type { AudioBubbleContent } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  content: AudioBubbleContent
  onTransitionEnd: (offsetTop?: number) => void
}

const showAnimationDuration = 400
const typingDuration = 100

let typingTimeout: NodeJS.Timeout

export const AudioBubble = (props: Props) => {
  let isPlayed = false
  let ref: HTMLDivElement | undefined
  let audioElement: HTMLAudioElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    typingTimeout = setTimeout(() => {
      if (isPlayed) return
      isPlayed = true
      setIsTyping(false)
      setTimeout(
        () => props.onTransitionEnd(ref?.offsetTop),
        showAnimationDuration
      )
    }, typingDuration)
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
            src={props.content.url}
            autoplay={props.content.isAutoplayEnabled ?? true}
            class={
              'z-10 text-fade-in ' +
              (isTyping() ? 'opacity-0' : 'opacity-100 m-2')
            }
            style={{
              height: isTyping() ? (isMobile() ? '32px' : '36px') : 'revert',
            }}
            controls
          />
        </div>
      </div>
    </div>
  )
}
