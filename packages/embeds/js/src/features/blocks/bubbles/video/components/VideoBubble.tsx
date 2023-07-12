import { TypingBubble } from '@/components'
import type { VideoBubbleContent } from '@typebot.io/schemas'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/enums'
import { createSignal, Match, onCleanup, onMount, Switch } from 'solid-js'

type Props = {
  content: VideoBubbleContent
  onTransitionEnd: (offsetTop?: number) => void
}

export const showAnimationDuration = 400
const defaultTypingDuration = 5000
let isPlayed = false

let typingTimeout: NodeJS.Timeout

export const VideoBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  let videoElement: HTMLVideoElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)

  const autoPlay = () => {
    isPlayed = true
    if (videoElement)
      videoElement
        .play()
        .catch((e) => console.warn('Could not autoplay the video:', e))
    props.onTransitionEnd(ref?.offsetTop)
  }

  onMount(() => {
    if (videoElement)
      videoElement.oncanplay = () => {
        if (isPlayed) return
        clearTimeout(typingTimeout)
        setIsTyping(false)
        setTimeout(autoPlay, showAnimationDuration)
      }
    typingTimeout = setTimeout(
      () => {
        if (isPlayed) return
        setIsTyping(false)
        setTimeout(autoPlay, showAnimationDuration)
      },
      videoElement ? defaultTypingDuration : 2000
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
          <Switch>
            <Match
              when={
                props.content?.type &&
                props.content.type === VideoBubbleContentType.URL
              }
            >
              <video
                ref={videoElement}
                src={props.content.url}
                controls
                class={
                  'p-4 focus:outline-none w-full z-10 text-fade-in rounded-md ' +
                  (isTyping() ? 'opacity-0' : 'opacity-100')
                }
                style={{
                  height: isTyping() ? '32px' : 'auto',
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
              <iframe
                src={`${
                  props.content.type === VideoBubbleContentType.VIMEO
                    ? 'https://player.vimeo.com/video'
                    : 'https://www.youtube.com/embed'
                }/${props.content.id}`}
                class={
                  'w-full p-4 text-fade-in z-10 ' +
                  (isTyping() ? 'opacity-0' : 'opacity-100')
                }
                height={isTyping() ? '32px' : '200px'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  )
}
