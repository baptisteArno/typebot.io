import { Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { I18nFunction } from '@/locales'

type Props = {
  scopedT: I18nFunction
  url: AudioBubbleContent['url']
}

export const AudioBubbleNode = ({ scopedT, url }: Props) =>
  isDefined(url) ? (
    <audio src={url} controls />
  ) : (
    <Text color={'gray.500'}>{scopedT('bubbles.audio.node.clickToEdit.text')}</Text>
  )
