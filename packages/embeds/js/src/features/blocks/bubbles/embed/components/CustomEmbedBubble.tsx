import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { clsx } from 'clsx'
import { CustomEmbedBubble as CustomEmbedBubbleProps } from '@typebot.io/schemas'
import { executeCode } from '@/features/blocks/logic/script/executeScript'

type Props = {
  content: CustomEmbedBubbleProps['content']
  onTransitionEnd: (offsetTop?: number) => void
  onCompleted: (reply?: string) => void
}

let typingTimeout: NodeJS.Timeout

export const showAnimationDuration = 400

export const CustomEmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
  let containerRef: HTMLDivElement | undefined

  onMount(() => {
    console.log(
      props.content.initFunction.content,
      props.content.initFunction.args
    )
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
        () => props.onTransitionEnd(ref?.offsetTop),
        showAnimationDuration
      )
    }, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col w-full animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble w-full max-w-full">
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
            <div class="w-full h-full overflow-scroll" ref={containerRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
