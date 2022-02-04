import { ItemType, StepBase } from '.'
import { ItemBase } from './item'

export type LogicStep = SetVariableStep | ConditionStep | RedirectStep

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
  REDIRECT = 'Redirect',
}

export type LogicStepOptions = SetVariableOptions | RedirectOptions

export type SetVariableStep = StepBase & {
  type: LogicStepType.SET_VARIABLE
  options: SetVariableOptions
}

export type ConditionStep = StepBase & {
  type: LogicStepType.CONDITION
  items: [ConditionItem]
}

export type ConditionItem = ItemBase & {
  type: ItemType.CONDITION
  content: ConditionContent
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

export type ConditionContent = {
  comparisons: Comparison[]
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

export const defaultConditionContent: ConditionContent = {
  comparisons: [],
  logicalOperator: LogicalOperator.AND,
}

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }
