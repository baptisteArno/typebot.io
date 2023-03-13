import React from 'react'
import { Text } from '@chakra-ui/react'
import { UrlInputOptions } from 'models'
import { WithVariableContent } from '@/features/graph/components/Nodes/BlockNode/BlockNodeContent/WithVariableContent'

type Props = {
  variableId?: string
  placeholder: UrlInputOptions['labels']['placeholder']
}

export const UrlNodeContent = ({ placeholder, variableId }: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>{placeholder}</Text>
  )
