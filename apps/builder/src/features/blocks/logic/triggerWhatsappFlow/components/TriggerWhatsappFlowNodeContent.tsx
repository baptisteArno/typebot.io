import { Text } from '@chakra-ui/react'
import { TriggerWhatsappFlowBlock } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: TriggerWhatsappFlowBlock['options']
}

export const TriggerWhatsappFlowNodeContent = ({ options }: Props) =>
  options?.flowName ? (
    <Text color="gray.500" noOfLines={1}>
      {options.flowName}
    </Text>
  ) : (
    <Text color="gray.500" fontStyle="italic" noOfLines={1}>
      Select a flow
    </Text>
  )
