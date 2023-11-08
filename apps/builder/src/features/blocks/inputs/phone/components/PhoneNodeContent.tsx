import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { PhoneNumberInputBlock } from '@typebot.io/schemas'
import { defaultPhoneInputOptions } from '@typebot.io/schemas/features/blocks/inputs/phone/constants'

type Props = {
  options: PhoneNumberInputBlock['options']
}

export const PhoneNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>
      {labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
    </Text>
  )
