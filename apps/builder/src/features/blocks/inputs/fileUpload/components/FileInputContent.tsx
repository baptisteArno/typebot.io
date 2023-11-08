import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { Text } from '@chakra-ui/react'
import { FileInputBlock } from '@typebot.io/schemas'

type Props = {
  options: FileInputBlock['options']
}

export const FileInputContent = ({ options }: Props) =>
  options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <Text noOfLines={1} pr="6">
      Collect {options?.isMultipleAllowed ? 'files' : 'file'}
    </Text>
  )
