import { TypingBubble } from '@/components/bubbles/TypingBubble'
import { TextBubbleContent, TypingEmulation } from 'models'
import { createSignal, onMount } from 'solid-js'
import { computeTypingDuration } from '../utils/computeTypingDuration'

type Props = {
  content: Pick<TextBubbleContent, 'html' | 'plainText'>
  onTransitionEnd: () => void
  typingEmulation?: TypingEmulation
}

export const showAnimationDuration = 400

const defaultTypingEmulation = {
  enabled: true,
  speed: 300,
  maxDelay: 1.5,
}

export const TextBubble = (props: Props) => {
  const [isTyping, setIsTyping] = createSignal(true)

  const onTypingEnd = () => {
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd()
    }, showAnimationDuration)
  }

  onMount(() => {
    if (!isTyping) return
    const typingDuration = computeTypingDuration(
      props.content.plainText,
      props.typingEmulation ?? defaultTypingEmulation
    )
    setTimeout(() => {
      onTypingEnd()
    }, typingDuration)
  })

  return (
    <div class="flex flex-col animate-fade-in">
      <div class="flex mb-2 w-full items-center">
        <div class={'flex relative items-start typebot-host-bubble'}>
          <div
            class="flex items-center absolute px-4 py-2 rounded-lg bubble-typing "
            style={{
              width: isTyping() ? '4rem' : '100%',
              height: isTyping() ? '2rem' : '100%',
            }}
            data-testid="host-bubble"
          >
            {isTyping() && <TypingBubble />}
          </div>
          <p
            style={{
              'text-overflow': 'ellipsis',
            }}
            class={
              'overflow-hidden text-fade-in mx-4 my-2 whitespace-pre-wrap slate-html-container relative ' +
              (isTyping() ? 'opacity-0 h-6' : 'opacity-100 h-full')
            }
            innerHTML={props.content.html}
          />
        </div>
      </div>
    </div>
  )
}
