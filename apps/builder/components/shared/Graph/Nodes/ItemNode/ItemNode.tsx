import { Flex } from '@chakra-ui/react'
import { ContextMenu } from 'components/shared/ContextMenu'
import { Coordinates } from 'contexts/GraphContext'
import { NodePosition, useDragDistance } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import {
  ButtonItem,
  ChoiceInputStep,
  Item,
  ItemIndices,
  ItemType,
} from 'models'
import React, { useRef, useState } from 'react'
import { setMultipleRefs } from 'services/utils'
import { SourceEndpoint } from '../../Endpoints/SourceEndpoint'
import { ItemNodeContent } from './ItemNodeContent'
import { ItemNodeContextMenu } from './ItemNodeContextMenu'

type Props = {
  item: Item
  indices: ItemIndices
  isReadOnly: boolean
  isLastItem: boolean
  onMouseDown?: (
    stepNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: ButtonItem
  ) => void
}

export const ItemNode = ({
  item,
  indices,
  isReadOnly,
  isLastItem,
  onMouseDown,
}: Props) => {
  const { typebot } = useTypebot()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const isConnectable = !(
    typebot?.blocks[indices.blockIndex].steps[
      indices.stepIndex
    ] as ChoiceInputStep
  )?.options?.isMultipleChoice
  const onDrag = (position: NodePosition) => {
    if (!onMouseDown || item.type !== ItemType.BUTTON) return
    onMouseDown(position, item)
  }
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onMouseDown || item.type !== ItemType.BUTTON,
  })

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <ItemNodeContextMenu indices={indices} />}
    >
      {(ref, isOpened) => (
        <Flex
          data-testid="item"
          ref={setMultipleRefs([ref, itemRef])}
          align="center"
          pos="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          shadow="sm"
          _hover={isReadOnly ? {} : { shadow: 'md' }}
          transition="box-shadow 200ms"
          borderWidth="1px"
          rounded="md"
          borderColor={isOpened ? 'blue.400' : 'gray.100'}
          pointerEvents={isReadOnly ? 'none' : 'all'}
          bgColor="white"
          w="full"
        >
          <ItemNodeContent
            item={item}
            isMouseOver={isMouseOver}
            indices={indices}
            isLastItem={isLastItem}
          />
          {typebot && isConnectable && (
            <SourceEndpoint
              source={{
                blockId: typebot.blocks[indices.blockIndex].id,
                stepId: item.stepId,
                itemId: item.id,
              }}
              pos="absolute"
              right="-49px"
              pointerEvents="all"
            />
          )}
        </Flex>
      )}
    </ContextMenu>
  )
}
