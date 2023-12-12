import { AudioBubble } from '@/features/blocks/bubbles/audio'
import { EmbedBubble } from '@/features/blocks/bubbles/embed'
import { CustomEmbedBubble } from '@/features/blocks/bubbles/embed/components/CustomEmbedBubble'
import { ImageBubble } from '@/features/blocks/bubbles/image'
import { TextBubble } from '@/features/blocks/bubbles/textBubble'
import { VideoBubble } from '@/features/blocks/bubbles/video'
import type {
  AudioBubbleBlock,
  ChatMessage,
  CustomEmbedBubble as CustomEmbedBubbleProps,
  EmbedBubbleBlock,
  ImageBubbleBlock,
  Settings,
  TextBubbleBlock,
  VideoBubbleBlock,
} from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { Match, Switch } from 'solid-js'

type Props = {
  message: ChatMessage
  typingEmulation: Settings['typingEmulation']
  onTransitionEnd: (offsetTop?: number) => void
  onCompleted: (reply?: string) => void
}

export const HostBubble = (props: Props) => {
  const onTransitionEnd = (offsetTop?: number) => {
    props.onTransitionEnd(offsetTop)
  }

  const onCompleted = (reply?: string) => {
    props.onCompleted(reply)
  }

  return (
    <Switch>
      <Match when={props.message.type === BubbleBlockType.TEXT}>
        <TextBubble
          content={props.message.content as TextBubbleBlock['content']}
          typingEmulation={props.typingEmulation}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.IMAGE}>
        <ImageBubble
          content={props.message.content as ImageBubbleBlock['content']}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.VIDEO}>
        <VideoBubble
          content={props.message.content as VideoBubbleBlock['content']}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.EMBED}>
        <EmbedBubble
          content={props.message.content as EmbedBubbleBlock['content']}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === 'custom-embed'}>
        <CustomEmbedBubble
          content={props.message.content as CustomEmbedBubbleProps['content']}
          onTransitionEnd={onTransitionEnd}
          onCompleted={onCompleted}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.AUDIO}>
        <AudioBubble
          content={props.message.content as AudioBubbleBlock['content']}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
    </Switch>
  )
}
