import { Comparison, ConditionOptions, LogicalOperator, Table } from 'models'
import React from 'react'
import { ComparisonsList } from './ComparisonsList'

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
    <ComparisonsList
      initialComparisons={options.comparisons}
      logicalOperator={options.logicalOperator ?? LogicalOperator.AND}
      onLogicalOperatorChange={handleLogicalOperatorChange}
      onComparisonsChange={handleComparisonsChange}
    />
  )
}
