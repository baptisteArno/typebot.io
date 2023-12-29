import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { TextInputBlock } from '@typebot.io/schemas'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'

type Props = {
  options: TextInputBlock['options']
}

export const TextInputNodeContent = ({ options }: Props) => {
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
        defaultTextInputOptions.labels.placeholder}
    </Text>
  )
}
