import { Stack, Wrap, Tag, Text, useColorModeValue } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { byId } from '@typebot.io/lib'
import { Condition, Variable } from '@typebot.io/schemas'
import { ComparisonOperators } from '@typebot.io/schemas/features/blocks/logic/condition/constants'

type Props = {
  condition: Condition | undefined
  variables: Variable[]
  size?: 'xs' | 'sm'
  displaySemicolon?: boolean
}
export const ConditionContent = ({
  condition,
  variables,
  size = 'sm',
  displaySemicolon,
}: Props) => {
	const { t } = useTranslate()
  const comparisonValueBg = useColorModeValue('gray.200', 'gray.700')
  return (
    <Stack>
      {condition?.comparisons?.map((comparison, idx) => {
        const variable = variables.find(byId(comparison.variableId))
        return (
          <Wrap key={comparison.id} spacing={1} noOfLines={1}>
            {idx === 0 && (
							<Text fontSize={size}>
								{t("editor.blocks.inputs.button.conditionContent.if.label")}
							</Text>
						)}
            {idx > 0 && (
              <Text fontSize={size}>
								{
									t(
										`components.dropdownList.item.${condition.logicalOperator?.replace(/\s/g, "")}`, ""
									)
								}
							</Text>
            )}
            {variable?.name && (
              <Tag bgColor="orange.400" color="white" size="sm">
                {variable.name}
              </Tag>
            )}
            {comparison.comparisonOperator && (
              <Text fontSize={size}>
                {
									t(parseComparisonOperatorSymbol(comparison.comparisonOperator))
								}
              </Text>
            )}
            {comparison?.value &&
              comparison.comparisonOperator !== ComparisonOperators.IS_SET &&
              comparison.comparisonOperator !==
                ComparisonOperators.IS_EMPTY && (
                <Tag bgColor={comparisonValueBg} size="sm">
                  {comparison.value}
                </Tag>
              )}
            {idx === (condition.comparisons?.length ?? 0) - 1 &&
              displaySemicolon && <Text fontSize={size}>:</Text>}
          </Wrap>
        )
      })}
    </Stack>
  )
}

const parseComparisonOperatorSymbol = (
  operator: ComparisonOperators
): string => {
  switch (operator) {
    case ComparisonOperators.CONTAINS:
      return 'components.dropdownList.item.contains'
    case ComparisonOperators.EQUAL:
      return '='
    case ComparisonOperators.GREATER:
      return '>'
    case ComparisonOperators.IS_SET:
      return 'components.dropdownList.item.isset'
    case ComparisonOperators.LESS:
      return '<'
    case ComparisonOperators.NOT_EQUAL:
      return '!='
    case ComparisonOperators.ENDS_WITH:
      return 'components.dropdownList.item.endswith'
    case ComparisonOperators.STARTS_WITH:
      return 'components.dropdownList.item.startswith'
    case ComparisonOperators.IS_EMPTY:
      return 'components.dropdownList.item.isempty'
    case ComparisonOperators.NOT_CONTAINS:
      return 'components.dropdownList.item.notcontains'
    case ComparisonOperators.MATCHES_REGEX:
      return 'components.dropdownList.item.matches'
    case ComparisonOperators.NOT_MATCH_REGEX:
      return 'components.dropdownList.item.notmatches'
  }
}
