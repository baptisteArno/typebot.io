import { ItemType, StepBase } from '.'
import { ItemBase } from './item'

export type LogicStep =
  | SetVariableStep
  | ConditionStep
  | RedirectStep
  | CodeStep
  | TypebotLinkStep

export type LogicStepOptions =
  // | SetVariableOptions
  | RedirectOptions
  | CodeOptions
  | TypebotLinkOptions

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
  REDIRECT = 'Redirect',
  CODE = 'Code',
  TYPEBOT_LINK = 'Typebot link',
}

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

export type CodeStep = StepBase & {
  type: LogicStepType.CODE
  options: CodeOptions
}

export type TypebotLinkStep = StepBase & {
  type: LogicStepType.TYPEBOT_LINK
  options: TypebotLinkOptions
}

export enum LogicalOperator {
  OR = 'OU',
  AND = 'E',
}

export enum ComparisonOperators {
  EQUAL = 'Igual a',
  NOT_EQUAL = 'Diferente',
  CONTAINS = 'Contém',
  GREATER = 'Maior que',
  LESS = 'Menor que',
  //IS_SET = 'Está configurado',
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
  isCode?: boolean
}

export type RedirectOptions = {
  url?: string
  isNewTab: boolean
}

export type CodeOptions = {
  name: string
  content?: string
}

export type TypebotLinkOptions = {
  typebotId?: string | 'current'
  blockId?: string
}

export const defaultSetVariablesOptions: SetVariableOptions = {}

export const defaultConditionContent: ConditionContent = {
  comparisons: [],
  logicalOperator: LogicalOperator.AND,
}

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }

export const defaultCodeOptions: CodeOptions = { name: 'Code snippet' }

export const defaultTypebotLinkOptions: TypebotLinkOptions = {}
