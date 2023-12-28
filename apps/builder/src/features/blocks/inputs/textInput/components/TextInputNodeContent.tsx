import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { TextInputBlock } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: TextInputBlock['options']
}

export const TextInputNodeContent = ({ options }: Props) => {
  const { t } = useTranslate()

  if (options?.variableId)
    return (
      <WithVariableContent
        variableId={options?.variableId}
        h={options.isLong ? '100px' : 'auto'}
      />
    )
  return (
    <Text color={'gray.500'} h={options?.isLong ? '100px' : 'auto'}>
      {options?.labels?.placeholder ??
        t('editor.blocks.inputs.text.placeholder.label')}
    </Text>
  )
}
