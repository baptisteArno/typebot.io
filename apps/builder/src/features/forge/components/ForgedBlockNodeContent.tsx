import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Text } from '@chakra-ui/react'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@sniper.io/forge-repository/types'

type Props = {
  block: ForgedBlock
}
export const ForgedBlockNodeContent = ({ block }: Props) => {
  const { blockDef, actionDef } = useForgedBlock(
    block.type,
    block.options?.action
  )
  const { sniper } = useSniper()

  const setVariableIds = actionDef?.getSetVariableIds?.(block.options) ?? []

  const isConfigured =
    block.options?.action && (!blockDef?.auth || block.options.credentialsId)
  return (
    <Stack>
      <Text color={isConfigured ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {isConfigured ? block.options.action : 'Configure...'}
      </Text>
      {sniper &&
        isConfigured &&
        setVariableIds.map((variableId, idx) => (
          <SetVariableLabel
            key={variableId + idx}
            variables={sniper.variables}
            variableId={variableId}
          />
        ))}
    </Stack>
  )
}
