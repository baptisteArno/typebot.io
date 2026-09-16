import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'

export const VideoLinkEmbedContent = ({
  content,
  updateUrl,
}: {
  content?: VideoBubbleBlock['content']
  updateUrl: (url: string) => void
}) => {
  const { t } = useTranslate()

  return (
    <Stack py="2">
      <TextInput
        placeholder={t('video.urlInput.placeholder')}
        defaultValue={content?.url ?? ''}
        onChange={updateUrl}
      />
      <Text fontSize="xs" color="gray.400" textAlign="center">
        {t('video.urlInput.helperText')}
      </Text>
    </Stack>
  )
}
