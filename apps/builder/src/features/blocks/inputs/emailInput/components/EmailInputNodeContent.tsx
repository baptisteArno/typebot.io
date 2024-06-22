import React from 'react'
import { Text } from '@chakra-ui/react'
import { EmailInputBlock } from '@sniper.io/schemas'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { defaultEmailInputOptions } from '@sniper.io/schemas/features/blocks/inputs/email/constants'

type Props = {
  options: EmailInputBlock['options']
}

export const EmailInputNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>
      {labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder}
    </Text>
  )
