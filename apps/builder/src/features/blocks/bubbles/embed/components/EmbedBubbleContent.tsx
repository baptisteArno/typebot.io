import { useScopedI18n } from '@/locales'
import { Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'

type Props = {
  block: EmbedBubbleBlock
}

export const EmbedBubbleContent = ({ block }: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.embed.node')
  if (!block.content?.url)
    return <Text color="gray.500">{scopedT('clickToEdit.text')}</Text>
  return <Text>{scopedT('show.text')}</Text>
}
