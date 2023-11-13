import { Text } from '@chakra-ui/react'
import { isDefined } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'
import { AudioBubbleBlock } from '@typebot.io/schemas'

type Props = {
  url: NonNullable<AudioBubbleBlock['content']>['url']
}

export const AudioBubbleNode = ({ url }: Props) => {
  const { t } = useTranslate()
  return isDefined(url) ? (
    <audio src={url} controls />
  ) : (
    <Text color={'gray.500'}>{t('clickToEdit')}</Text>
  )
}
