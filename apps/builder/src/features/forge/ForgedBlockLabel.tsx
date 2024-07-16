import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { useForgedBlock } from './hooks/useForgedBlock'
import { Text, TextProps } from '@chakra-ui/react'

export const ForgedBlockLabel = ({
  type,
  ...props
}: { type: ForgedBlock['type'] } & TextProps) => {
  const { blockDef } = useForgedBlock(type)

  return (
    <Text fontSize="sm" {...props}>
      {blockDef?.name}
    </Text>
  )
}
