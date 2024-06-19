import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Comparison,
  ConditionItem,
  ComparisonOperators,
  LogicalOperator,
  Variable,
} from 'models'
import React from 'react'
import { byIdOrToken, isNotDefined } from 'utils'

type Props = {
  item: ConditionItem
}

export const ConditionNodeContent = ({ item }: Props) => {
  const { typebot, customVariables } = useTypebot()

  const getComparisonValue = (
    variable: Variable | undefined,
    comparison: Comparison
  ) => {
    if (variable?.type !== 'select' || !variable) return comparison.value

    return customVariables.find((v) => comparison.value === v.id)?.name
  }
  const content = () => {
    if (
      item.content.comparisons.length === 0 ||
      comparisonIsEmpty(item.content.comparisons[0])
    ) {
      return <Text color={'gray.500'}>Adicionar uma regra...</Text>
    }

    return (
      <Stack maxW="170px">
        {item.content.comparisons.map((comparison, idx) => {
          const variable = typebot?.variables.find(
            byIdOrToken(comparison.variableId)
          )
          return (
            <Wrap key={comparison.id} spacing={1} noOfLines={0}>
              {idx > 0 && (
                <Text>
                  {parseLogicalOperatorSymbol(item.content.logicalOperator) ??
                    ''}
                </Text>
              )}
              {variable?.token && (
                <Tag bgColor="orange.400" color="white">
                  {variable.token}
                </Tag>
              )}
              {comparison.comparisonOperator && (
                <Text>
                  {parseComparisonOperatorSymbol(comparison.comparisonOperator)}
                </Text>
              )}
              {comparison?.value && (
                <Tag bgColor={'gray.200'}>
                  <Text noOfLines={0}>
                    {getComparisonValue(variable, comparison)}
                  </Text>
                </Tag>
              )}
              {comparison?.secondaryValue && (
                <div>
                  <span> E </span>
                  <Tag bgColor={'gray.200'}>
                    <Text noOfLines={0}>{comparison.secondaryValue}</Text>
                  </Tag>
                </div>
              )}
            </Wrap>
          )
        })}
      </Stack>
    )
  }

  return (
    <Flex px={2} py={2}>
      {content()}
    </Flex>
  )
}

const comparisonIsEmpty = (comparison: Comparison) =>
  isNotDefined(comparison.comparisonOperator) &&
  isNotDefined(comparison.value) &&
  isNotDefined(comparison.variableId)

const parseLogicalOperatorSymbol = (operator: LogicalOperator) => {
  const toCompare = Object.keys(LogicalOperator).indexOf(operator)

  return Object.values(LogicalOperator)[toCompare]
}

const parseComparisonOperatorSymbol = (operator: ComparisonOperators) => {
  const toCompare = Object.keys(ComparisonOperators).indexOf(operator)
  switch (Object.values(ComparisonOperators)[toCompare]) {
    case ComparisonOperators.CONTAINS:
      return 'contém'
    case ComparisonOperators.EQUAL:
      return '='
    case ComparisonOperators.NOT_EQUAL:
      return '!='
    case ComparisonOperators.GREATER:
      return '>'
    case ComparisonOperators.GREATER_OR_EQUAL:
      return '>='
    case ComparisonOperators.LESS:
      return '<'
    case ComparisonOperators.LESS_OR_EQUAL:
      return '<='
    case ComparisonOperators.EMPTY:
      return 'é vazio'
    case ComparisonOperators.NOT_EMPTY:
      return 'não é vazio'
    case ComparisonOperators.START_WITH:
      return 'inicia com'
    case ComparisonOperators.NOT_START_WITH:
      return 'não inicia com'
    case ComparisonOperators.END_WITH:
      return 'termina com'
    case ComparisonOperators.NOT_END_WITH:
      return 'não termina com'
    case ComparisonOperators.NOT_CONTAINS:
      return 'não contém'
    case ComparisonOperators.BETWEEN:
      return ' estiver entre '
    case ComparisonOperators.NOT_BETWEEN:
      return ' não estiver entre '
  }
}
