import { ImageUploadContent } from '@/components/ImageUploadContent'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { useTranslate } from '@tolgee/react'
import { Stack, Text } from '@chakra-ui/react'
import { ImageBubbleBlock } from '@typebot.io/schemas'
import { TElement } from '@udecode/plate-common'
import React from 'react'
import { RichTextCaptionEditor } from '@/components/RichTextCaptionEditor'

const acceptedImageFileTypes = ['image/jpeg', 'image/png']
const maxImageUploadSizeInMB = 5

type Props = {
  uploadFileProps: FilePathUploadProps
  block: ImageBubbleBlock
  onContentChange: (content: ImageBubbleBlock['content']) => void
}

export const ImageBubbleSettings = ({
  uploadFileProps,
  block,
  onContentChange,
}: Props) => {
  const { t } = useTranslate()

  const updateImage = (url: string) => {
    onContentChange({ ...block.content, url })
  }

  const updateCaption = (caption: TElement[]) => {
    onContentChange({ ...block.content, caption })
  }

  return (
    <Stack p="2" spacing={4}>
      <Stack spacing={1}>
        <ImageUploadContent
          uploadFileProps={uploadFileProps}
          defaultUrl={block.content?.url}
          onSubmit={updateImage}
          excludedTabs={['emoji', 'icon']}
          acceptedFileTypes={acceptedImageFileTypes}
          maxUploadFileSizeInMB={maxImageUploadSizeInMB}
        />
        <Text fontSize="sm" color="gray.500">
          {t('editor.blocks.bubbles.image.helperText.label')}
        </Text>
      </Stack>
      <Stack spacing={1}>
        <Text fontSize="sm" fontWeight="medium">
          {t('editor.blocks.bubbles.image.caption.label')}
        </Text>
        <RichTextCaptionEditor
          id={`image-caption-${block.id}`}
          initialValue={block.content?.caption ?? []}
          onChange={updateCaption}
        />
        <Text fontSize="sm" color="gray.500">
          {t('editor.blocks.bubbles.image.caption.helperText')}
        </Text>
      </Stack>
    </Stack>
  )
}
