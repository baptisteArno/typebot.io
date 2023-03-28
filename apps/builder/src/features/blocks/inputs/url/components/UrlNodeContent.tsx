import React from 'react'
import { Text } from '@chakra-ui/react'
import { UrlInputOptions } from '@typebot.io/schemas'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'

type Props = {
  variableId?: string
  placeholder: UrlInputOptions['labels']['placeholder']
}

export const UrlNodeContent = ({ placeholder, variableId }: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'} w="90%">
      {placeholder}
    </Text>
  )
