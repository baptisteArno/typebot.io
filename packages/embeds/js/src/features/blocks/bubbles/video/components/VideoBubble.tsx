import { TypingBubble } from '@/components'
import { isMobile } from '@/utils/isMobileSignal'
import type { VideoBubbleContent } from '@typebot.io/schemas'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/enums'
import { createSignal, Match, onCleanup, onMount, Switch } from 'solid-js'
import { clsx } from 'clsx'

type Props = {
  content: VideoBubbleContent
  onTransitionEnd: (offsetTop?: number) => void
}

export const showAnimationDuration = 400
let typingTimeout: NodeJS.Timeout

export const VideoBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  onMount(() => {
    const typingDuration =
      props.content?.type &&
      [VideoBubbleContentType.VIMEO, VideoBubbleContentType.YOUTUBE].includes(
        props.content?.type
      )
        ? 2000
        : 100
    typingTimeout = setTimeout(() => {
      if (!isTyping()) return
      setIsTyping(false)
      setTimeout(() => {
        props.onTransitionEnd(ref?.offsetTop)
      }, showAnimationDuration)
    }, typingDuration)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble overflow-hidden">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <Switch>
            <Match
              when={
                props.content?.type &&
                props.content.type === VideoBubbleContentType.URL
              }
            >
              <video
                autoplay
                src={props.content.url}
                controls
                class={
                  'p-4 focus:outline-none w-full z-10 text-fade-in rounded-md ' +
                  (isTyping() ? 'opacity-0' : 'opacity-100')
                }
                style={{
                  height: isTyping() ? (isMobile() ? '32px' : '36px') : 'auto',
                }}
              />
            </Match>
            <Match
              when={
                props.content?.type &&
                [
                  VideoBubbleContentType.VIMEO,
                  VideoBubbleContentType.YOUTUBE,
                ].includes(props.content.type)
              }
            >
              <div
                class={clsx(
                  'p-4 z-10 text-fade-in w-full',
                  isTyping() ? 'opacity-0' : 'opacity-100 p-4'
                )}
                style={{
                  height: isTyping() ? (isMobile() ? '32px' : '36px') : '200px',
                }}
              >
                <iframe
                  src={`${
                    props.content.type === VideoBubbleContentType.VIMEO
                      ? 'https://player.vimeo.com/video'
                      : 'https://www.youtube.com/embed'
                  }/${props.content.id}`}
                  class={'w-full h-full'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  )
}
