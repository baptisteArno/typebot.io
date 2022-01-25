import { StepBase } from '.'
import { Table } from '../..'

export type LogicStep = SetVariableStep | ConditionStep | RedirectStep

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
  REDIRECT = 'Redirect',
}

export type LogicStepOptions =
  | SetVariableOptions
  | ConditionOptions
  | RedirectOptions

export type SetVariableStep = StepBase & {
  type: LogicStepType.SET_VARIABLE
  options: SetVariableOptions
}

export type ConditionStep = StepBase & {
  type: LogicStepType.CONDITION
  options: ConditionOptions
  trueEdgeId?: string
  falseEdgeId?: string
}

export type RedirectStep = StepBase & {
  type: LogicStepType.REDIRECT
  options: RedirectOptions
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

export type ConditionOptions = {
  comparisons: Table<Comparison>
  logicalOperator: LogicalOperator
}

export type Comparison = {
  id: string
  variableId?: string
  comparisonOperator?: ComparisonOperators
  value?: string
}

export type SetVariableOptions = {
  variableId?: string
  expressionToEvaluate?: string
}

export type RedirectOptions = {
  url?: string
  isNewTab: boolean
}

export const defaultSetVariablesOptions: SetVariableOptions = {}

export const defaultConditionOptions: ConditionOptions = {
  comparisons: { byId: {}, allIds: [] },
  logicalOperator: LogicalOperator.AND,
}

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }
