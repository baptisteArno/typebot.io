import { Flex, useColorModeValue, Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { BlockWithItems, Item, ItemIndices } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'
import { ItemNodeContent } from './ItemNodeContent'
import { ItemNodeContextMenu } from './ItemNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { isDefined } from '@typebot.io/lib'
import { Coordinates } from '@/features/graph/types'
import {
  DraggableItem,
  NodePosition,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { ConditionContent } from '@/features/blocks/logic/condition/components/ConditionContent'
import { useRouter } from 'next/router'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

type Props = {
  item: Item
  block: BlockWithItems
  indices: ItemIndices
  onMouseDown?: (
    blockNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: DraggableItem
  ) => void
  connectionDisabled?: boolean
}

export const ItemNode = ({
  item,
  block,
  indices,
  onMouseDown,
  connectionDisabled,
}: Props) => {
  const previewingBorderColor = useColorModeValue('orange.400', 'orange.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bg = useColorModeValue('white', 'gray.850')
  const { typebot } = useTypebot()
  const { previewingEdge } = useGraph()
  const { pathname } = useRouter()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const isPreviewing =
    previewingEdge &&
    'itemId' in previewingEdge.from &&
    previewingEdge.from.itemId === item.id
  const isConnectable =
    isDefined(typebot) &&
    !connectionDisabled &&
    !(
      block.options &&
      'isMultipleChoice' in block.options &&
      block.options.isMultipleChoice
    )
  const onDrag = (position: NodePosition) => {
    if (!onMouseDown || block.type === LogicBlockType.AB_TEST) return
    onMouseDown(position, { ...item, type: block.type, blockId: block.id })
  }
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onMouseDown,
  })

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  const groupId = typebot?.groups.at(indices.groupIndex)?.id

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <ItemNodeContextMenu indices={indices} />}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          data-testid="item"
          pos="relative"
          ref={setMultipleRefs([ref, itemRef])}
          w="full"
        >
          {'displayCondition' in item &&
            item.displayCondition?.isEnabled &&
            item.displayCondition.condition && (
              <ConditionContent
                condition={item.displayCondition.condition}
                variables={typebot?.variables ?? []}
                size="xs"
                displaySemicolon
              />
            )}
          <Flex
            align="center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            shadow="sm"
            _hover={{ shadow: 'md' }}
            transition="box-shadow 200ms, border-color 200ms"
            rounded="md"
            bg={bg}
            borderWidth={1}
            borderColor={
              isContextMenuOpened || isPreviewing
                ? previewingBorderColor
                : borderColor
            }
            w="full"
          >
            <ItemNodeContent
              blockType={block.type}
              item={item}
              isMouseOver={isMouseOver}
              indices={indices}
            />
            {typebot &&
              (isConnectable || pathname.endsWith('analytics')) &&
              groupId && (
                <BlockSourceEndpoint
                  source={{
                    blockId: block.id,
                    itemId: item.id,
                  }}
                  groupId={groupId}
                  pos="absolute"
                  right="-49px"
                  bottom="9px"
                  pointerEvents="all"
                  isHidden={!isConnectable}
                />
              )}
          </Flex>
        </Stack>
      )}
    </ContextMenu>
  )
}
