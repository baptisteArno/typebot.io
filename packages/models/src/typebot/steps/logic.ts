import { StepBase, Target } from '.'
import { Table } from '../..'

export type LogicStep = SetVariableStep | ConditionStep

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
}

export type SetVariableStep = StepBase & {
  type: LogicStepType.SET_VARIABLE
  options?: SetVariableOptions
}

export enum LogicalOperator {
  OR = 'OR',
  AND = 'AND',
}

export enum ComparisonOperators {
  EQUAL = 'Equal to',
  NOT_EQUAL = 'Not equal',
  CONTAINS = 'Contains',
  GREATER = 'Greater than',
  LESS = 'Less than',
  IS_SET = 'Is set',
}

export type ConditionStep = StepBase & {
  type: LogicStepType.CONDITION
  options: ConditionOptions
  trueTarget?: Target
  falseTarget?: Target
}

export type ConditionOptions = {
  comparisons: Table<Comparison>
  logicalOperator?: LogicalOperator
}

export type Comparison = {
  id: string
  variableId?: string
  comparisonOperator: ComparisonOperators
  value?: string
}

export type SetVariableOptions = {
  variableId?: string
  expressionToEvaluate?: string
}
