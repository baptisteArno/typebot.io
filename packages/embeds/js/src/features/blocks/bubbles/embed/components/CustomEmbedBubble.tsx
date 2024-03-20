import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { clsx } from 'clsx'
import { CustomEmbedBubble as CustomEmbedBubbleProps } from '@typebot.io/schemas'
import { executeCode } from '@/features/blocks/logic/script/executeScript'
import { botContainerHeight } from '@/utils/botContainerHeightSignal'

type Props = {
  content: CustomEmbedBubbleProps['content']
  onTransitionEnd?: (offsetTop?: number) => void
  onCompleted: (reply?: string) => void
}

let typingTimeout: NodeJS.Timeout

export const showAnimationDuration = 400

export const CustomEmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false
  )
  let containerRef: HTMLDivElement | undefined

  onMount(() => {
    executeCode({
      args: {
        ...props.content.initFunction.args,
        typebotElement: containerRef,
      },
      content: props.content.initFunction.content,
    })

    if (props.content.waitForEventFunction)
      executeCode({
        args: {
          ...props.content.waitForEventFunction.args,
          continueFlow: props.onCompleted,
        },
        content: props.content.waitForEventFunction.content,
      })

    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setTimeout(
        () => props.onTransitionEnd?.(ref?.offsetTop),
        showAnimationDuration
      )
    }, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div
      class={clsx(
        'flex flex-col w-full',
        props.onTransitionEnd ? 'animate-fade-in' : undefined
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div
          class="flex relative z-10 items-start typebot-host-bubble w-full"
          style={{
            'max-width': props.content.maxBubbleWidth
              ? `${props.content.maxBubbleWidth}px`
              : '100%',
          }}
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
              'p-2 z-20 text-fade-in w-full',
              isTyping() ? 'opacity-0' : 'opacity-100'
            )}
            style={{
              height: isTyping() ? (isMobile() ? '32px' : '36px') : undefined,
            }}
          >
            <div
              class="w-full overflow-y-auto"
              style={{ 'max-height': `calc(${botContainerHeight()} - 100px)` }}
              ref={containerRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
