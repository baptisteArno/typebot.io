import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { useForgedBlock } from './hooks/useForgedBlock'
import { Text } from '@chakra-ui/react'

export const ForgedBlockLabel = ({ type }: { type: ForgedBlock['type'] }) => {
  const { blockDef } = useForgedBlock(type)

  return <Text fontSize="sm">{blockDef?.name}</Text>
}
