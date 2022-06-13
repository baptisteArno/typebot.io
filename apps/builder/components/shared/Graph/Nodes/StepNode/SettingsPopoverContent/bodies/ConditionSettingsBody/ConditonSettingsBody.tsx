import { Flex } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList } from 'components/shared/TableList'
import {
  Comparison,
  ConditionItem,
  ConditionStep,
  LogicalOperator,
} from 'models'
import React from 'react'
import { ComparisonItem } from './ComparisonsItem'

type ConditionSettingsBodyProps = {
  step: ConditionStep
  onItemChange: (updates: Partial<ConditionItem>) => void
}

export const ConditionSettingsBody = ({
  step,
  onItemChange,
}: ConditionSettingsBodyProps) => {
  const itemContent = step.items[0].content

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
          <DropdownList<LogicalOperator>
            currentItem={itemContent.logicalOperator}
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Adicione uma comparação"
    />
  )
}
