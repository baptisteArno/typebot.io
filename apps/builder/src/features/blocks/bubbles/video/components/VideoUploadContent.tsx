import { Stack, Text } from '@chakra-ui/react'
import {
  VariableString,
  VideoBubbleContent,
  VideoBubbleContentType,
} from '@typebot.io/schemas'
import { NumberInput, TextInput } from '@/components/inputs'
import { useTranslate } from '@tolgee/react'
import { parseVideoUrl } from '@typebot.io/lib/parseVideoUrl'

type Props = {
  content?: VideoBubbleContent
  onSubmit: (content: VideoBubbleContent) => void
}

export const VideoUploadContent = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate()
  const updateUrl = (url: string) => {
    const info = parseVideoUrl(url)
    return onSubmit({
      type: info.type,
      url,
      id: info.id,
    })
  }
  const updateHeight = (height?: number | VariableString) => {
    return onSubmit({
      ...content,
      height,
    })
  }
  return (
    <Stack p="2" spacing={4}>
      <Stack>
        <TextInput
          placeholder={t(
            'editor.blocks.bubbles.video.settings.worksWith.placeholder'
          )}
          defaultValue={content?.url ?? ''}
          onChange={updateUrl}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {t('editor.blocks.bubbles.video.settings.worksWith.text')}
        </Text>
      </Stack>

      {content?.type !== VideoBubbleContentType.URL && (
        <NumberInput
          label="Height:"
          defaultValue={content?.height ?? 400}
          onValueChange={updateHeight}
          suffix={t('editor.blocks.bubbles.video.settings.numberInput.unit')}
          width="150px"
        />
      )}
    </Stack>
  )
}
