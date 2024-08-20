import { AudioBubble } from '@/features/blocks/bubbles/audio'
import { EmbedBubble } from '@/features/blocks/bubbles/embed'
import { CustomEmbedBubble } from '@/features/blocks/bubbles/embed/components/CustomEmbedBubble'
import { ImageBubble } from '@/features/blocks/bubbles/image'
import { TextBubble } from '@/features/blocks/bubbles/textBubble'
import { VideoBubble } from '@/features/blocks/bubbles/video'
import { InputSubmitContent } from '@/types'
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
  isTypingSkipped: boolean
  onTransitionEnd?: (ref?: HTMLDivElement) => void
  onCompleted: (reply?: InputSubmitContent) => void
}

export const HostBubble = (props: Props) => (
  <Switch>
    <Match when={props.message.type === BubbleBlockType.TEXT}>
      <TextBubble
        content={props.message.content as TextBubbleBlock['content']}
        isTypingSkipped={props.isTypingSkipped}
        typingEmulation={props.typingEmulation}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.IMAGE}>
      <ImageBubble
        content={props.message.content as ImageBubbleBlock['content']}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.VIDEO}>
      <VideoBubble
        content={props.message.content as VideoBubbleBlock['content']}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.EMBED}>
      <EmbedBubble
        content={props.message.content as EmbedBubbleBlock['content']}
        onTransitionEnd={props.onTransitionEnd}
        onCompleted={props.onCompleted}
      />
    </Match>
    <Match when={props.message.type === 'custom-embed'}>
      <CustomEmbedBubble
        content={props.message.content as CustomEmbedBubbleProps['content']}
        onTransitionEnd={props.onTransitionEnd}
        onCompleted={props.onCompleted}
      />
    </Match>
    <Match when={props.message.type === BubbleBlockType.AUDIO}>
      <AudioBubble
        content={props.message.content as AudioBubbleBlock['content']}
        onTransitionEnd={props.onTransitionEnd}
      />
    </Match>
  </Switch>
)
