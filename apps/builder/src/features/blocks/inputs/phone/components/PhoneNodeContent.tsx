import React from 'react'
import { Text } from '@chakra-ui/react'
import { PhoneNumberInputOptions } from '@typebot.io/schemas'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'

type Props = {
  variableId?: string
  placeholder: PhoneNumberInputOptions['labels']['placeholder']
}

export const PhoneNodeContent = ({ variableId, placeholder }: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>{placeholder}</Text>
  )
