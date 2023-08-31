import { AudioBubbleForm } from '@/features/blocks/bubbles/audio/components/AudioBubbleForm'
import { EmbedUploadContent } from '@/features/blocks/bubbles/embed/components/EmbedUploadContent'
import { ImageBubbleSettings } from '@/features/blocks/bubbles/image/components/ImageBubbleSettings'
import { VideoUploadContent } from '@/features/blocks/bubbles/video/components/VideoUploadContent'
import { I18nFunction } from '@/locales'
import {
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react'
import {
  BubbleBlock,
  BubbleBlockContent,
  BubbleBlockType,
  TextBubbleBlock,
} from '@typebot.io/schemas'
import { useRef } from 'react'

type Props = {
  scopedT: I18nFunction
  typebotId: string
  block: Exclude<BubbleBlock, TextBubbleBlock>
  onContentChange: (content: BubbleBlockContent) => void
}

export const MediaBubblePopoverContent = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Portal>
      <PopoverContent
        onMouseDown={handleMouseDown}
        w={props.block.type === BubbleBlockType.IMAGE ? '500px' : '400px'}
      >
        <PopoverArrow />
        <PopoverBody ref={ref} shadow="lg">
          <MediaBubbleContent {...props} />
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

export const MediaBubbleContent = ({
  scopedT,
  typebotId,
  block,
  onContentChange,
}: Props) => {
  switch (block.type) {
    case BubbleBlockType.IMAGE: {
      return (
        <ImageBubbleSettings
          scopedT={scopedT}
          typebotId={typebotId}
          block={block}
          onContentChange={onContentChange}
        />
      )
    }
    case BubbleBlockType.VIDEO: {
      return (
        <VideoUploadContent
          scopedT={scopedT}
          content={block.content}
          onSubmit={onContentChange}
        />
      )
    }
    case BubbleBlockType.EMBED: {
      return (
        <EmbedUploadContent
          scopedT={scopedT}
          content={block.content}
          onSubmit={onContentChange}
        />
      )
    }
    case BubbleBlockType.AUDIO: {
      return (
        <AudioBubbleForm
          scopedT={scopedT}
          content={block.content}
          fileUploadPath={`typebots/${typebotId}/blocks/${block.id}`}
          onContentChange={onContentChange}
        />
      )
    }
  }
}
