import { AudioBubble } from '@/features/blocks/bubbles/audio'
import { EmbedBubble } from '@/features/blocks/bubbles/embed'
import { ImageBubble } from '@/features/blocks/bubbles/image'
import { TextBubble } from '@/features/blocks/bubbles/textBubble'
import { VideoBubble } from '@/features/blocks/bubbles/video'
import {
  AudioBubbleContent,
  BubbleBlockType,
  ChatMessage,
  EmbedBubbleContent,
  ImageBubbleContent,
  TextBubbleContent,
  VideoBubbleContent,
} from 'models'
import { Match, Switch } from 'solid-js'

type Props = {
  message: ChatMessage
  onTransitionEnd: () => void
}

export const HostBubble = (props: Props) => {
  const onTransitionEnd = () => {
    props.onTransitionEnd()
  }

  return (
    <Switch>
      <Match when={props.message.type === BubbleBlockType.TEXT}>
        <TextBubble
          content={props.message.content as Omit<TextBubbleContent, 'richText'>}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.IMAGE}>
        <ImageBubble
          url={(props.message.content as ImageBubbleContent).url}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.VIDEO}>
        <VideoBubble
          content={props.message.content as VideoBubbleContent}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.EMBED}>
        <EmbedBubble
          content={props.message.content as EmbedBubbleContent}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.AUDIO}>
        <AudioBubble
          url={(props.message.content as AudioBubbleContent).url}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
    </Switch>
  )
}
