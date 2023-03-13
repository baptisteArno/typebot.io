import React from 'react'
import { Text } from '@chakra-ui/react'
import { TextInputOptions } from 'models'
import { WithVariableContent } from '@/features/graph/components/Nodes/BlockNode/BlockNodeContent/WithVariableContent'

type Props = {
  placeholder: TextInputOptions['labels']['placeholder']
  isLong: TextInputOptions['isLong']
  variableId?: string
}

export const TextInputNodeContent = ({
  placeholder,
  isLong,
  variableId,
}: Props) => {
  if (variableId)
    return (
      <WithVariableContent
        variableId={variableId}
        h={isLong ? '100px' : 'auto'}
      />
    )
  return (
    <Text color={'gray.500'} h={isLong ? '100px' : 'auto'}>
      {placeholder}
    </Text>
  )
}
