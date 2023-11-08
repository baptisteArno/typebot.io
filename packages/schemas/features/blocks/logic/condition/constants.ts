import { ConditionBlock } from './schema'

export enum LogicalOperator {
  OR = 'OR',
  AND = 'AND',
}

export enum ComparisonOperators {
  EQUAL = 'Equal to',
  NOT_EQUAL = 'Not equal',
  CONTAINS = 'Contains',
  NOT_CONTAINS = 'Does not contain',
  GREATER = 'Greater than',
  LESS = 'Less than',
  IS_SET = 'Is set',
  IS_EMPTY = 'Is empty',
  STARTS_WITH = 'Starts with',
  ENDS_WITH = 'Ends with',
  MATCHES_REGEX = 'Matches regex',
  NOT_MATCH_REGEX = 'Does not match regex',
}

export const defaultConditionItemContent = {
  logicalOperator: LogicalOperator.AND,
} as const satisfies ConditionBlock['items'][number]['content']
