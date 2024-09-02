import { chakra, Text } from '@chakra-ui/react'
import { isDefined } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'
import { AudioBubbleBlock } from '@typebot.io/schemas'
import { findUniqueVariable } from '@typebot.io/variables/findUniqueVariableValue'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'

type Props = {
  url: NonNullable<AudioBubbleBlock['content']>['url']
}

export const AudioBubbleNode = ({ url }: Props) => {
  const { typebot } = useTypebot()
  const { t } = useTranslate()
  const variable = typebot ? findUniqueVariable(typebot?.variables)(url) : null
  return isDefined(url) ? (
    variable ? (
      <Text>
        Play <VariableTag variableName={variable.name} />
      </Text>
    ) : (
      <chakra.audio src={url} controls maxW="calc(100% - 25px)" rounded="md" />
    )
  ) : (
    <Text color={'gray.500'}>{t('clickToEdit')}</Text>
  )
}
