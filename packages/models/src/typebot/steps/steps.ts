import {
  InputStepOptions,
  IntegrationStepOptions,
  IntegrationStepType,
  Item,
  LogicStepOptions,
} from '.'
import { BubbleStep, BubbleStepType } from './bubble'
import { AskNameInputStep, InputStep, InputStepType } from './inputs'
import { IntegrationStep } from './integration'
import { ConditionStep, LogicStep, LogicStepType } from './logic'
import { OctaBubbleStepType, OctaStep, OctaStepType, OctaBubbleStep, OctaCommerceOptions } from './octaStep'
import { WabaStep, WabaStepType } from './waba'

export type Step =
  | StartStep
  | BubbleStep
  | InputStep
  | LogicStep
  | IntegrationStep
  | OctaStep
  | OctaBubbleStep
  | AskNameInputStep
  | WabaStep

export type DraggableStep = BubbleStep | InputStep | LogicStep | IntegrationStep | OctaStep | OctaBubbleStep | WabaStep

export type StepType =
  | 'start'
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType
  | OctaStepType // todos os tipos possíveis
  | OctaBubbleStepType // !!
  | WabaStepType

export type DraggableStepType =
  | BubbleStepType
  | InputStepType
  | LogicStepType
  | IntegrationStepType
  | OctaStepType
  | OctaBubbleStepType
  | WabaStepType

export type StepWithOptions =
  | InputStep
  | Exclude<LogicStep, ConditionStep>
  | IntegrationStep

export type StepWithOptionsType =
  | InputStepType
  | Exclude<LogicStepType, LogicStepType.CONDITION>
  | Exclude<IntegrationStepType, IntegrationStepType.WEBHOOK>
  | IntegrationStepType

export type StepOptions =
  | InputStepOptions
  | LogicStepOptions
  | IntegrationStepOptions
  | OctaCommerceOptions

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
