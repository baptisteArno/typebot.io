import { Flex } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { Comparison, ConditionItem, LogicalOperator } from '@typebot.io/schemas'
import React from 'react'
import { ComparisonItem } from './ComparisonItem'
import { TableList } from '@/components/TableList'

type Props = {
  itemContent: ConditionItem['content']
  onItemChange: (updates: Partial<ConditionItem>) => void
}

export const ConditionItemForm = ({ itemContent, onItemChange }: Props) => {
  const handleComparisonsChange = (comparisons: Comparison[]) =>
    onItemChange({ content: { ...itemContent, comparisons } })
  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onItemChange({ content: { ...itemContent, logicalOperator } })

  return (
    <TableList<Comparison>
      initialItems={itemContent.comparisons}
      onItemsChange={handleComparisonsChange}
      Item={ComparisonItem}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList
            currentItem={itemContent.logicalOperator}
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Add a comparison"
    />
  )
}
