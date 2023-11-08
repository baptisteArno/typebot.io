import { ImageUploadContent } from '@/components/ImageUploadContent'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { useTranslate } from '@tolgee/react'
import { Stack } from '@chakra-ui/react'
import { isDefined, isNotEmpty } from '@typebot.io/lib'
import { ImageBubbleBlock } from '@typebot.io/schemas'
import React, { useState } from 'react'
import { defaultImageBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/image/constants'

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
  const [showClickLinkInput, setShowClickLinkInput] = useState(
    isNotEmpty(block.content?.clickLink?.url)
  )

  const updateImage = (url: string) => {
    onContentChange({ ...block.content, url })
  }

  const updateClickLinkUrl = (url: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, url },
    })
  }

  const updateClickLinkAltText = (alt: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, alt },
    })
  }

  const toggleClickLink = () => {
    if (isDefined(block.content?.clickLink) && showClickLinkInput) {
      onContentChange({ ...block.content, clickLink: undefined })
    }
    setShowClickLinkInput(!showClickLinkInput)
  }

  return (
    <Stack p="2" spacing={4}>
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultUrl={block.content?.url}
        onSubmit={updateImage}
        excludedTabs={['emoji']}
      />
      <Stack>
        <SwitchWithLabel
          label={t('editor.blocks.bubbles.image.switchWithLabel.onClick.label')}
          initialValue={showClickLinkInput}
          onCheckChange={toggleClickLink}
        />
        {showClickLinkInput && (
          <>
            <TextInput
              autoFocus
              placeholder="https://example.com"
              onChange={updateClickLinkUrl}
              defaultValue={block.content?.clickLink?.url}
            />
            <TextInput
              placeholder={t(
                'editor.blocks.bubbles.image.switchWithLabel.onClick.placeholder'
              )}
              onChange={updateClickLinkAltText}
              defaultValue={
                block.content?.clickLink?.alt ??
                defaultImageBubbleContent.clickLink.alt
              }
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}
