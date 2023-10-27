import { Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'

type Props = {
  url: AudioBubbleContent['url']
}

export const AudioBubbleNode = ({ url }: Props) => {
  const { t } = useTranslate()
  return isDefined(url) ? (
    <audio src={url} controls />
  ) : (
    <Text color={'gray.500'}>
      {t('editor.blocks.bubbles.audio.node.clickToEdit.text')}
    </Text>
  )
}
