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
  EQUAL = 'For igual a',
  NOT_EQUAL = 'For diferente de',
  GREATER = 'For maior que',
  GREATER_OR_EQUAL = 'For maior ou igual a',
  LESS = 'For menor que',
  LESS_OR_EQUAL = 'For menor ou igual a',
  EMPTY = 'Estiver vazio',
  NOT_EMPTY = 'Não estiver vazio',
  START_WITH = 'Começar com',
  NOT_START_WITH = 'Não começar com',
  END_WITH = 'Terminar com',
  NOT_END_WITH = 'Não terminar com',
  CONTAINS = 'Contém',
  NOT_CONTAINS = 'Não contém',
  BETWEEN = 'Estiver entre',
  NOT_BETWEEN = 'Não estiver entre',
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
  secondaryValue?: string
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
  logicalOperator: 'AND' as LogicalOperator,
}

export const defaultRedirectOptions: RedirectOptions = { isNewTab: false }

export const defaultCodeOptions: CodeOptions = { name: 'Code snippet' }

export const defaultTypebotLinkOptions: TypebotLinkOptions = {}
