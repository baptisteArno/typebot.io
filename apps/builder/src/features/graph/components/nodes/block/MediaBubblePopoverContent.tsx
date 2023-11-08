import { AudioBubbleForm } from '@/features/blocks/bubbles/audio/components/AudioBubbleForm'
import { EmbedUploadContent } from '@/features/blocks/bubbles/embed/components/EmbedUploadContent'
import { ImageBubbleSettings } from '@/features/blocks/bubbles/image/components/ImageBubbleSettings'
import { VideoUploadContent } from '@/features/blocks/bubbles/video/components/VideoUploadContent'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import {
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react'
import {
  BubbleBlock,
  BubbleBlockContent,
  TextBubbleBlock,
} from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { useRef } from 'react'

type Props = {
  uploadFileProps: FilePathUploadProps
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
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  switch (block.type) {
    case BubbleBlockType.IMAGE: {
      return (
        <ImageBubbleSettings
          uploadFileProps={uploadFileProps}
          block={block}
          onContentChange={onContentChange}
        />
      )
    }
    case BubbleBlockType.VIDEO: {
      return (
        <VideoUploadContent
          content={block.content}
          onSubmit={onContentChange}
        />
      )
    }
    case BubbleBlockType.EMBED: {
      return (
        <EmbedUploadContent
          content={block.content}
          onSubmit={onContentChange}
        />
      )
    }
    case BubbleBlockType.AUDIO: {
      return (
        <AudioBubbleForm
          content={block.content}
          uploadFileProps={uploadFileProps}
          onContentChange={onContentChange}
        />
      )
    }
  }
}
