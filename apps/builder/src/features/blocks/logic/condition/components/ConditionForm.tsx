import { Flex } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { Comparison, Condition } from '@typebot.io/schemas'
import React from 'react'
import { ComparisonItem } from './ComparisonItem'
import { TableList } from '@/components/TableList'
import {
  LogicalOperator,
} from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  condition: Condition | undefined
  onConditionChange: (newCondition: Condition) => void
}

export const ConditionForm = ({ condition, onConditionChange }: Props) => {
	const { t } = useTranslate()
  const handleComparisonsChange = (comparisons: Comparison[]) =>
    onConditionChange({ ...condition, comparisons })
  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onConditionChange({ ...condition, logicalOperator })

  return (
    <TableList<Comparison>
      initialItems={condition?.comparisons}
      onItemsChange={handleComparisonsChange}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList
            currentItem={
              t(
								`components.dropdownList.item.${condition?.logicalOperator?.replace(/\s/g, '')}`,
								condition?.logicalOperator
							) as LogicalOperator ??
								t("components.dropdownList.item.AND") as LogicalOperator
						}
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel={t("editor.blocks.inputs.button.buttonSettings.addComparisonButton.label")}
    >
      {(props) => <ComparisonItem {...props} />}
    </TableList>
  )
}
