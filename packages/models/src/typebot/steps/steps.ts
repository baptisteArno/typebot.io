import {
  InputStepOptions,
  IntegrationStepOptions,
  IntegrationStepType,
  LogicStepOptions,
} from '.'
import { BubbleStep, BubbleStepType } from './bubble'
import { InputStep, InputStepType } from './inputs'
import { IntegrationStep } from './integration'
import { LogicStep, LogicStepType } from './logic'

export type Step =
  | StartStep
  | BubbleStep
  | InputStep
  | LogicStep
  | IntegrationStep

export type DraggableStep = BubbleStep | InputStep | LogicStep | IntegrationStep

export type StepType =
  | 'start'
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType

export type DraggableStepType =
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType

export type StepOptions =
  | InputStepOptions
  | LogicStepOptions
  | IntegrationStepOptions

export type StepBase = { id: string; blockId: string; edgeId?: string }

export type StartStep = StepBase & {
  type: 'start'
  label: string
}
