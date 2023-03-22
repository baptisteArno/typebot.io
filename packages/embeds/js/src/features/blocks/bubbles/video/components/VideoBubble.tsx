import { TypingBubble } from '@/components'
import type { VideoBubbleContent } from '@typebot.io/schemas'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/enums'
import { createSignal, Match, onCleanup, onMount, Switch } from 'solid-js'

type Props = {
  content: VideoBubbleContent
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

let typingTimeout: NodeJS.Timeout

export const VideoBubble = (props: Props) => {
  const [isTyping, setIsTyping] = createSignal(true)

  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd()
    }, showAnimationDuration)
  }

  onMount(() => {
    typingTimeout = setTimeout(onTypingEnd, 2000)
  })

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col animate-fade-in">
      <div class="flex mb-2 w-full items-center">
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
          <VideoContent content={props.content} isTyping={isTyping()} />
        </div>
      </div>
    </div>
  )
}

type VideoContentProps = {
  content: VideoBubbleContent
  isTyping: boolean
}

const VideoContent = (props: VideoContentProps) => {
  return (
    <Switch>
      <Match
        when={
          props.content?.type &&
          props.content.type === VideoBubbleContentType.URL
        }
      >
        <video
          controls
          class={
            'p-4 focus:outline-none w-full z-10 text-fade-in ' +
            (props.isTyping ? 'opacity-0' : 'opacity-100')
          }
          style={{
            height: props.isTyping ? '32px' : 'auto',
            'max-height': window.navigator.vendor.match(/apple/i) ? '40vh' : '',
          }}
          autoplay
        >
          <source src={props.content.url} type="video/mp4" />
          Sorry, your browser doesn&apos;t support embedded videos.
        </video>
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
            (props.isTyping ? 'opacity-0' : 'opacity-100')
          }
          height={props.isTyping ? '32px' : '200px'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </Match>
    </Switch>
  )
}
