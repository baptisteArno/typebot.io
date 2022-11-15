import { BlockIcon } from '@/features/editor'
import { StackProps, HStack } from '@chakra-ui/react'
import { StartBlock, Block, BlockIndices } from 'models'
import { BlockNodeContent } from './BlockNodeContent/BlockNodeContent'

export const BlockNodeOverlay = ({
  block,
  indices,
  ...props
}: { block: Block | StartBlock; indices: BlockIndices } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      bgColor="white"
      cursor={'grab'}
      w="264px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      <BlockIcon type={block.type} />
      <BlockNodeContent block={block} indices={indices} />
    </HStack>
  )
}
