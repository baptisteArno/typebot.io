import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack, Text } from '@chakra-ui/react'
import { WebhookBlock } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import React from 'react'

type Props = {
  options: WebhookBlock['options']
}

export const WebhookNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Stack>
      <Text noOfLines={1}>Listen for webhook</Text>
      {typebot &&
        options?.responseVariableMapping
          ?.filter((mapping) => isDefined(mapping.variableId))
          .map((mapping, idx) => (
            <SetVariableLabel
              key={mapping.variableId! + idx}
              variables={typebot.variables}
              variableId={mapping.variableId!}
            />
          ))}
    </Stack>
  )
}
