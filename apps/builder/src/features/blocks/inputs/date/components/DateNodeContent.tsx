import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'

type Props = {
  variableId?: string
}
export const DateNodeContent = ({ variableId }: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>Pick a date...</Text>
  )
