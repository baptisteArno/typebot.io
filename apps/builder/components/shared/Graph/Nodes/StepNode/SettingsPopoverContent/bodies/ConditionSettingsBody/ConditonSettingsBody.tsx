import { Flex } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList } from 'components/shared/TableList'
import { Comparison, ConditionOptions, LogicalOperator, Table } from 'models'
import React from 'react'
import { ComparisonItem } from './ComparisonsItem'

type ConditionSettingsBodyProps = {
  options: ConditionOptions
  onOptionsChange: (options: ConditionOptions) => void
}

export const ConditionSettingsBody = ({
  options,
  onOptionsChange,
}: ConditionSettingsBodyProps) => {
  const handleComparisonsChange = (comparisons: Table<Comparison>) =>
    onOptionsChange({ ...options, comparisons })
  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onOptionsChange({ ...options, logicalOperator })

  return (
    <TableList<Comparison>
      initialItems={options.comparisons}
      onItemsChange={handleComparisonsChange}
      Item={ComparisonItem}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList<LogicalOperator>
            currentItem={options.logicalOperator}
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Add a comparison"
    />
  )
}
