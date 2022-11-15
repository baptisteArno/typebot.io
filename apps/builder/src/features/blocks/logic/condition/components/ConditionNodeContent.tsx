import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { Comparison, ConditionItem, ComparisonOperators } from 'models'
import React from 'react'
import { byId, isNotDefined } from 'utils'

type Props = {
  item: ConditionItem
}

export const ConditionNodeContent = ({ item }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Flex px={2} py={2}>
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
                {idx > 0 && <Text>{item.content.logicalOperator ?? ''}</Text>}
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
                  <Tag bgColor={'gray.200'}>
                    <Text noOfLines={1}>{comparison.value}</Text>
                  </Tag>
                )}
              </Wrap>
            )
          })}
        </Stack>
      )}
    </Flex>
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
