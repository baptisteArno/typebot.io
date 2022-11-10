import { Text } from '@chakra-ui/react'
import { ChatwootBlock } from 'models'

type Props = {
  block: ChatwootBlock
}

export const ChatwootBlockNodeLabel = ({ block }: Props) =>
  block.options.websiteToken.length === 0 ? (
    <Text color="gray.500">Configure...</Text>
  ) : (
    <Text>Open Chatwoot</Text>
  )
