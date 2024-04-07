import { TypingBubble } from '@/components'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { ImageBubbleBlock } from '@typebot.io/schemas'
import { defaultImageBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/image/constants'

type Props = {
  content: ImageBubbleBlock['content']
  onTransitionEnd?: (offsetTop?: number) => void
}

export const showAnimationDuration = 400

export const mediaLoadingFallbackTimeout = 5000

let typingTimeout: NodeJS.Timeout

export const ImageBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  let image: HTMLImageElement | undefined
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false
  )

  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd?.(ref?.offsetTop)
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

  const Image = (
    <img
      ref={image}
      src={props.content?.url}
      alt={
        props.content?.clickLink?.alt ?? defaultImageBubbleContent.clickLink.alt
      }
      class={clsx(
        isTyping() ? 'opacity-0' : 'opacity-100',
        props.onTransitionEnd ? 'text-fade-in' : undefined
      )}
      style={{
        'max-height': '512px',
        height: isTyping() ? '32px' : 'auto',
      }}
      elementtiming={'Bubble image'}
      fetchpriority={'high'}
    />
  )

  return (
    <div
      class={clsx(
        'flex flex-col',
        props.onTransitionEnd ? 'animate-fade-in' : undefined
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() ? <TypingBubble /> : null}
          </div>
          {props.content?.clickLink ? (
            <a
              href={props.content.clickLink.url}
              target="_blank"
              class={clsx('z-10', isTyping() ? 'h-8' : 'p-4')}
            >
              {Image}
            </a>
          ) : (
            <figure
              class={clsx(
                'z-10',
                !isTyping() && 'p-4',
                isTyping() ? (isMobile() ? 'h-8' : 'h-9') : ''
              )}
            >
              {Image}
            </figure>
          )}
        </div>
      </div>
    </div>
  )
}
