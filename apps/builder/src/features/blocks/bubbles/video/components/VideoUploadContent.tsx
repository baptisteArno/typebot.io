import { Stack, Text } from '@chakra-ui/react'
import { VideoBubbleContent } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useScopedI18n } from '@/locales'
import { parseVideoUrl } from '@typebot.io/lib/parseVideoUrl'

type Props = {
  content?: VideoBubbleContent
  onSubmit: (content: VideoBubbleContent) => void
}

export const VideoUploadContent = ({ content, onSubmit }: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.video.settings')
  const handleUrlChange = (url: string) => {
    const info = parseVideoUrl(url)
    return onSubmit({
      type: info.type,
      url,
      id: info.id,
    })
  }
  return (
    <Stack p="2">
      <TextInput
        placeholder={scopedT('worksWith.placeholder')}
        defaultValue={content?.url ?? ''}
        onChange={handleUrlChange}
      />
      <Text fontSize="sm" color="gray.400" textAlign="center">
        {scopedT('worksWith.text')}
      </Text>
    </Stack>
  )
}
