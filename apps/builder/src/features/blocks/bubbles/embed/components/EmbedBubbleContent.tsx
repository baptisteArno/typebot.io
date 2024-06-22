import { useTranslate } from '@tolgee/react'
import { Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@sniper.io/schemas'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useSniper } from '@/features/editor/providers/SniperProvider'

type Props = {
  block: EmbedBubbleBlock
}

export const EmbedBubbleContent = ({ block }: Props) => {
  const { sniper } = useSniper()
  const { t } = useTranslate()
  if (!block.content?.url)
    return <Text color="gray.500">{t('clickToEdit')}</Text>
  return (
    <Stack>
      <Text>{t('editor.blocks.bubbles.embed.node.show.text')}</Text>
      {sniper &&
        block.content.waitForEvent?.isEnabled &&
        block.content.waitForEvent.saveDataInVariableId && (
          <SetVariableLabel
            variables={sniper.variables}
            variableId={block.content.waitForEvent.saveDataInVariableId}
          />
        )}
    </Stack>
  )
}
