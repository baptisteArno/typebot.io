import {
  InputStepOptions,
  IntegrationStepOptions,
  IntegrationStepType,
  Item,
  LogicStepOptions,
} from '.'
import { BubbleStep, BubbleStepType } from './bubble'
import { InputStep, InputStepType } from './inputs'
import { IntegrationStep } from './integration'
import { ConditionStep, LogicStep, LogicStepType } from './logic'
import { OctaStepType } from './octaStep'

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
  | OctaStepType

export type DraggableStepType =
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType
  | OctaStepType

export type StepWithOptions =
  | InputStep
  | Exclude<LogicStep, ConditionStep>
  | IntegrationStep

export type StepWithOptionsType =
  | InputStepType
  | Exclude<LogicStepType, LogicStepType.CONDITION>
  | IntegrationStepType
  | OctaStepType

export type StepOptions =
  | InputStepOptions
  | LogicStepOptions
  | IntegrationStepOptions

export type StepWithItems = Omit<Step, 'items'> & { items: Item[] }

export type StepBase = { id: string; blockId: string; outgoingEdgeId?: string }

export type StartStep = StepBase & {
  type: 'start'
  label: string
}

export type StepIndices = {
  blockIndex: number
  stepIndex: number
}
