import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { TextInputBlock } from '@typebot.io/schemas'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'

type Props = {
  options: TextInputBlock['options']
}

export const TextInputNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot()
  const attachmentVariableId =
    typebot &&
    options?.attachments?.isEnabled &&
    options?.attachments.saveVariableId
  const audioClipVariableId =
    typebot &&
    options?.audioClip?.isEnabled &&
    options?.audioClip.saveVariableId
  if (options?.variableId)
    return (
      <Stack w="calc(100% - 25px)">
        <WithVariableContent
          variableId={options?.variableId}
          h={options.isLong ? '100px' : 'auto'}
        />
        {attachmentVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={attachmentVariableId}
          />
        )}
        {audioClipVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={audioClipVariableId}
          />
        )}
      </Stack>
    )
  return (
    <Stack>
      <Text color={'gray.500'} h={options?.isLong ? '100px' : 'auto'}>
        {options?.labels?.placeholder ??
          defaultTextInputOptions.labels.placeholder}
      </Text>
      {attachmentVariableId && (
        <SetVariableLabel
          variables={typebot.variables}
          variableId={attachmentVariableId}
        />
      )}
      {audioClipVariableId && (
        <SetVariableLabel
          variables={typebot.variables}
          variableId={audioClipVariableId}
        />
      )}
    </Stack>
  )
}
