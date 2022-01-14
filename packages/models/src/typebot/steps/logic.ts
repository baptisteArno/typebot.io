import { StepBase } from '.'

export type LogicStep = SetVariableStep

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
}

export type SetVariableStep = StepBase & {
  type: LogicStepType.SET_VARIABLE
  options?: SetVariableOptions
}

export type SetVariableOptions = {
  variableId?: string
  expressionToEvaluate?: string
}
