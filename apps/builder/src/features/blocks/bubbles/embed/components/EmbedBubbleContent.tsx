import { useTranslate } from '@tolgee/react'
import { Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'

type Props = {
  block: EmbedBubbleBlock
}

export const EmbedBubbleContent = ({ block }: Props) => {
  const { t } = useTranslate()
  if (!block.content?.url)
    return <Text color="gray.500">{t('clickToEdit')}</Text>
  return <Text>{t('editor.blocks.bubbles.embed.node.show.text')}</Text>
}
