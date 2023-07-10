import { FormLabel, Stack } from '@chakra-ui/react'
import { MediaBubbleContent, TextBubbleContent } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { ImageUploadContent } from 'components/shared/ImageUploadContent'

type InputMediaSettingBodyProps = {
  step: {
    type: string,
    content: MediaBubbleContent
  }
  onContentChange: (content: MediaBubbleContent) => void
}

export const InputMediaSettingBody = ({
  step,
  onContentChange,
}: InputMediaSettingBodyProps) => {
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onContentChange({
      ...step.content,
      message: content
    })
  }

  const handleImageUrlChange = (url: string, type: string, name: string, size: number) => onContentChange({ ...step.content, url, type, name, size })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Texto da mensagem:
        </FormLabel>
        (
        <TextBubbleEditor
          increment={1}
          onClose={handleCloseEditorBotMessage}
          initialValue={
            step.content.message
              ? step.content.message.richText
              : []
          }
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      <Stack>
        <ImageUploadContent url={step.content?.url} name={step.content?.name} onSubmit={handleImageUrlChange} />
      </Stack>
    </Stack>
  )
}
