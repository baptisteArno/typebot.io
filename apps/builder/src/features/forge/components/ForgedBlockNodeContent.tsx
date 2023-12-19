import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack, Text } from '@chakra-ui/react'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@typebot.io/forge-schemas'

type Props = {
  block: ForgedBlock
}
export const ForgedBlockNodeContent = ({ block }: Props) => {
  const { blockDef, actionDef } = useForgedBlock(
    block.type,
    block.options?.action
  )
  const { typebot } = useTypebot()

  const setVariableIds = actionDef?.getSetVariableIds?.(block.options) ?? []

  const isConfigured =
    block.options?.action && (!blockDef?.auth || block.options.credentialsId)
  return (
    <Stack>
      <Text color={isConfigured ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {isConfigured ? block.options.action : 'Configure...'}
      </Text>
      {typebot &&
        isConfigured &&
        setVariableIds.map((variableId, idx) => (
          <SetVariableLabel
            key={variableId + idx}
            variables={typebot.variables}
            variableId={variableId}
          />
        ))}
    </Stack>
  )
}
