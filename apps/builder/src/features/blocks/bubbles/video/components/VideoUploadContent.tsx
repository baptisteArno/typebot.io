import { Stack, Text } from '@chakra-ui/react'
import { VideoBubbleContent, VideoBubbleContentType } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useScopedI18n } from '@/locales'

const vimeoRegex = /vimeo\.com\/(\d+)/
const youtubeRegex = /youtube\.com\/(watch\?v=|shorts\/)(\w+)|youtu\.be\/(\w+)/

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

const parseVideoUrl = (
  url: string
): { type: VideoBubbleContentType; url: string; id?: string } => {
  if (vimeoRegex.test(url)) {
    const id = url.match(vimeoRegex)?.at(1)
    if (!id) return { type: VideoBubbleContentType.URL, url }
    return { type: VideoBubbleContentType.VIMEO, url, id }
  }
  if (youtubeRegex.test(url)) {
    const id = url.match(youtubeRegex)?.at(2) ?? url.match(youtubeRegex)?.at(3)
    if (!id) return { type: VideoBubbleContentType.URL, url }
    return { type: VideoBubbleContentType.YOUTUBE, url, id }
  }
  return { type: VideoBubbleContentType.URL, url }
}
