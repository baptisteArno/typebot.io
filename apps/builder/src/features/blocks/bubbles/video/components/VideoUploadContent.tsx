import { Stack, Text } from '@chakra-ui/react'
import { VideoBubbleContent, VideoBubbleContentType } from '@typebot.io/schemas'
import urlParser from 'js-video-url-parser/lib/base'
import 'js-video-url-parser/lib/provider/vimeo'
import 'js-video-url-parser/lib/provider/youtube'
import { isDefined } from '@typebot.io/lib'
import { TextInput } from '@/components/inputs'

type Props = {
  content?: VideoBubbleContent
  onSubmit: (content: VideoBubbleContent) => void
}

export const VideoUploadContent = ({ content, onSubmit }: Props) => {
  const handleUrlChange = (url: string) => {
    const info = urlParser.parse(url)
    return isDefined(info) && info.provider && info.id
      ? onSubmit({
          type: info.provider as VideoBubbleContentType,
          url,
          id: info.id,
        })
      : onSubmit({ type: VideoBubbleContentType.URL, url })
  }
  return (
    <Stack p="2">
      <TextInput
        placeholder="Paste the video link..."
        defaultValue={content?.url ?? ''}
        onChange={handleUrlChange}
      />
      <Text fontSize="sm" color="gray.400" textAlign="center">
        Works with Youtube, Vimeo and others
      </Text>
    </Stack>
  )
}
