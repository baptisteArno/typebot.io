import { Flex, useColorModeValue, Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  ChoiceInputBlock,
  Item,
  ItemIndices,
  ItemType,
} from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { SourceEndpoint } from '../../endpoints/SourceEndpoint'
import { ItemNodeContent } from './ItemNodeContent'
import { ItemNodeContextMenu } from './ItemNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { isDefined } from '@typebot.io/lib'
import { Coordinates } from '@/features/graph/types'
import {
  DraggabbleItem,
  NodePosition,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { ConditionContent } from '@/features/blocks/logic/condition/components/ConditionContent'

type Props = {
  item: Item
  indices: ItemIndices
  onMouseDown?: (
    blockNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: DraggabbleItem
  ) => void
  connectionDisabled?: boolean
}

export const ItemNode = ({
  item,
  indices,
  onMouseDown,
  connectionDisabled,
}: Props) => {
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bg = useColorModeValue('white', 'gray.850')
  const { typebot } = useTypebot()
  const { previewingEdge } = useGraph()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const isPreviewing = previewingEdge?.from.itemId === item.id
  const isConnectable =
    isDefined(typebot) &&
    !connectionDisabled &&
    !(
      typebot.groups[indices.groupIndex].blocks[indices.blockIndex] as
        | ChoiceInputBlock
        | undefined
    )?.options?.isMultipleChoice
  const onDrag = (position: NodePosition) => {
    if (!onMouseDown || item.type === ItemType.AB_TEST) return
    onMouseDown(position, item)
  }
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onMouseDown,
  })

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

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
              item={item}
              isMouseOver={isMouseOver}
              indices={indices}
            />
            {typebot && isConnectable && (
              <SourceEndpoint
                source={{
                  groupId: typebot.groups[indices.groupIndex].id,
                  blockId: item.blockId,
                  itemId: item.id,
                }}
                pos="absolute"
                right="-49px"
                bottom="9px"
                pointerEvents="all"
              />
            )}
          </Flex>
        </Stack>
      )}
    </ContextMenu>
  )
}
