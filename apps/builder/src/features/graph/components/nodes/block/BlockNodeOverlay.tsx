import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { StackProps, HStack, useColorModeValue } from '@chakra-ui/react'
import { StartBlock, Block, BlockIndices } from '@typebot.io/schemas'
import { BlockNodeContent } from './BlockNodeContent'
import { I18nFunction } from '@/locales'

export const BlockNodeOverlay = ({
  scopedT,
  block,
  indices,
  ...props
}: { scopedT: I18nFunction; block: Block | StartBlock; indices: BlockIndices } & StackProps) => {
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
      <BlockNodeContent scopedT={scopedT} block={block} indices={indices} />
    </HStack>
  )
}
