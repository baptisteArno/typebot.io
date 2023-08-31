import { Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'
import { I18nFunction } from '@/locales'

type Props = {
  scopedT: I18nFunction
  block: EmbedBubbleBlock
}

export const EmbedBubbleContent = ({ scopedT, block }: Props) => {
  if (!block.content?.url) return <Text color="gray.500">{scopedT('bubbles.embed.node.clickToEdit.text')}</Text>
  return <Text>{scopedT('node.show.text')}</Text>
}
