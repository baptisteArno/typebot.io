import { Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { useScopedI18n } from '@/locales'

type Props = {
  url: AudioBubbleContent['url']
}

export const AudioBubbleNode = ({ url }: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.audio.node')
  return isDefined(url) ? (
    <audio src={url} controls />
  ) : (
    <Text color={'gray.500'}>{scopedT('clickToEdit.text')}</Text>
  )
}
