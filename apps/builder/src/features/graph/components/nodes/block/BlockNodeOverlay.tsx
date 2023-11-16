import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { StackProps, HStack, useColorModeValue } from '@chakra-ui/react'
import { BlockIndices, BlockV6 } from '@typebot.io/schemas'
import { BlockNodeContent } from './BlockNodeContent'

export const BlockNodeOverlay = ({
  block,
  indices,
  ...props
}: { block: BlockV6; indices: BlockIndices } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      borderColor={useColorModeValue('gray.200', 'gray.800')}
      bgColor={useColorModeValue('gray.50', 'gray.850')}
      cursor={'grab'}
      w="264px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      <BlockIcon type={block.type} />
      <BlockNodeContent block={block} indices={indices} groupId="" />
    </HStack>
  )
}
