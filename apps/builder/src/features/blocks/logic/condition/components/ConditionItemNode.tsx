import {
  Stack,
  Tag,
  Text,
  Flex,
  Wrap,
  Fade,
  IconButton,
  PopoverTrigger,
  Popover,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Comparison,
  ConditionItem,
  ComparisonOperators,
  ItemType,
  ItemIndices,
} from '@typebot.io/schemas'
import React, { useRef } from 'react'
import { byId, isNotDefined } from '@typebot.io/lib'
import { PlusIcon } from '@/components/icons'
import { ConditionItemForm } from './ConditionItemForm'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { createId } from '@paralleldrive/cuid2'

type Props = {
  item: ConditionItem
  isMouseOver: boolean
  indices: ItemIndices
}

export const ConditionItemNode = ({ item, isMouseOver, indices }: Props) => {
  const comparisonValueBg = useColorModeValue('gray.200', 'gray.700')
  const { typebot, createItem, updateItem } = useTypebot()
  const { openedItemId, setOpenedItemId } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const openPopover = () => {
    setOpenedItemId(item.id)
  }

  const handleItemChange = (updates: Partial<ConditionItem>) => {
    updateItem(indices, { ...item, ...updates })
  }

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    const itemIndex = indices.itemIndex + 1
    const newItemId = createId()
    createItem(
      {
        blockId: item.blockId,
        type: ItemType.CONDITION,
        id: newItemId,
      },
      { ...indices, itemIndex }
    )
    setOpenedItemId(newItemId)
  }

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)

  return (
    <Popover
      placement="left"
      isLazy
      isOpen={openedItemId === item.id}
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <Flex p={3} pos="relative" w="full" onClick={openPopover}>
          {item.content.comparisons.length === 0 ||
          comparisonIsEmpty(item.content.comparisons[0]) ? (
            <Text color={'gray.500'}>Configure...</Text>
          ) : (
            <Stack maxW="170px">
              {item.content.comparisons.map((comparison, idx) => {
                const variable = typebot?.variables.find(
                  byId(comparison.variableId)
                )
                return (
                  <Wrap key={comparison.id} spacing={1} noOfLines={1}>
                    {idx > 0 && (
                      <Text>{item.content.logicalOperator ?? ''}</Text>
                    )}
                    {variable?.name && (
                      <Tag bgColor="orange.400" color="white">
                        {variable.name}
                      </Tag>
                    )}
                    {comparison.comparisonOperator && (
                      <Text>
                        {parseComparisonOperatorSymbol(
                          comparison.comparisonOperator
                        )}
                      </Text>
                    )}
                    {comparison?.value && (
                      <Tag bgColor={comparisonValueBg}>
                        <Text noOfLines={1}>{comparison.value}</Text>
                      </Tag>
                    )}
                  </Wrap>
                )
              })}
            </Stack>
          )}
          <Fade
            in={isMouseOver}
            style={{
              position: 'absolute',
              bottom: '-15px',
              zIndex: 3,
              left: '90px',
            }}
            unmountOnExit
          >
            <IconButton
              aria-label="Add item"
              icon={<PlusIcon />}
              size="xs"
              shadow="md"
              colorScheme="gray"
              onClick={handlePlusClick}
            />
          </Fade>
        </Flex>
      </PopoverTrigger>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody
            py="6"
            overflowY="scroll"
            maxH="400px"
            shadow="lg"
            ref={ref}
          >
            <ConditionItemForm
              itemContent={item.content}
              onItemChange={handleItemChange}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

const comparisonIsEmpty = (comparison: Comparison) =>
  isNotDefined(comparison.comparisonOperator) &&
  isNotDefined(comparison.value) &&
  isNotDefined(comparison.variableId)

const parseComparisonOperatorSymbol = (operator: ComparisonOperators) => {
  switch (operator) {
    case ComparisonOperators.CONTAINS:
      return 'contains'
    case ComparisonOperators.EQUAL:
      return '='
    case ComparisonOperators.GREATER:
      return '>'
    case ComparisonOperators.IS_SET:
      return 'is set'
    case ComparisonOperators.LESS:
      return '<'
    case ComparisonOperators.NOT_EQUAL:
      return '!='
  }
}
