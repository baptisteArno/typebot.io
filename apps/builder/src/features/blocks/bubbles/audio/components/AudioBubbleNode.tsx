import { Text } from '@chakra-ui/react'
import { AudioBubbleContent } from 'models'
import { isDefined } from 'utils'

type Props = {
  url: AudioBubbleContent['url']
}

export const AudioBubbleNode = ({ url }: Props) =>
  isDefined(url) ? (
    <audio src={url} controls />
  ) : (
    <Text color={'gray.500'}>Click to edit...</Text>
  )
