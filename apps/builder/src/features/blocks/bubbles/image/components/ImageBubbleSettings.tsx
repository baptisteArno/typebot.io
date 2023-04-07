import { ImageUploadContent } from '@/components/ImageUploadContent'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Stack } from '@chakra-ui/react'
import { isDefined, isNotEmpty } from '@typebot.io/lib'
import { ImageBubbleBlock } from '@typebot.io/schemas'
import React, { useState } from 'react'

type Props = {
  typebotId: string
  block: ImageBubbleBlock
  onContentChange: (content: ImageBubbleBlock['content']) => void
}

export const ImageBubbleSettings = ({
  typebotId,
  block,
  onContentChange,
}: Props) => {
  const [showClickLinkInput, setShowClickLinkInput] = useState(
    isNotEmpty(block.content.clickLink?.url)
  )

  const updateImage = (url: string) => {
    onContentChange({ ...block.content, url })
  }

  const updateClickLinkUrl = (url: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content.clickLink, url },
    })
  }

  const updateClickLinkAltText = (alt: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content.clickLink, alt },
    })
  }

  const toggleClickLink = () => {
    if (isDefined(block.content.clickLink) && showClickLinkInput) {
      onContentChange({ ...block.content, clickLink: undefined })
    }
    setShowClickLinkInput(!showClickLinkInput)
  }

  return (
    <Stack p="2" spacing={4}>
      <ImageUploadContent
        filePath={`typebots/${typebotId}/blocks/${block.id}`}
        defaultUrl={block.content?.url}
        onSubmit={updateImage}
      />
      <Stack>
        <SwitchWithLabel
          label={'On click link'}
          initialValue={showClickLinkInput}
          onCheckChange={toggleClickLink}
        />
        {showClickLinkInput && (
          <>
            <TextInput
              autoFocus
              placeholder="https://example.com"
              onChange={updateClickLinkUrl}
              defaultValue={block.content.clickLink?.url}
            />
            <TextInput
              placeholder="Link alt text (description)"
              onChange={updateClickLinkAltText}
              defaultValue={block.content.clickLink?.alt}
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}
