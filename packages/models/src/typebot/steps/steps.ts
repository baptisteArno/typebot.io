import {
  InputStepOptions,
  IntegrationStepOptions,
  Item,
  LogicStepOptions,
} from '.'
import { BubbleStep, bubbleStepSchema } from './bubble'
import { InputStep, inputStepSchema } from './input'
import { IntegrationStep, integrationStepSchema } from './integration'
import { ConditionStep, LogicStep, logicStepSchema } from './logic'
import { z } from 'zod'
import {
  BubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  stepBaseSchema,
} from './shared'

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

export type StepWithOptions =
  | InputStep
  | Exclude<LogicStep, ConditionStep>
  | IntegrationStep

export type StepWithOptionsType =
  | InputStepType
  | Exclude<LogicStepType, LogicStepType.CONDITION>
  | IntegrationStepType

export type StepOptions =
  | InputStepOptions
  | LogicStepOptions
  | IntegrationStepOptions

export type StepWithItems = Omit<Step, 'items'> & { items: Item[] }

export type StepBase = z.infer<typeof stepBaseSchema>

const startStepSchema = stepBaseSchema.and(
  z.object({
    type: z.literal('start'),
    label: z.string(),
  })
)

export type StartStep = z.infer<typeof startStepSchema>

export type StepIndices = {
  blockIndex: number
  stepIndex: number
}

export const stepSchema = startStepSchema
  .or(bubbleStepSchema)
  .or(inputStepSchema)
  .or(logicStepSchema)
  .or(integrationStepSchema)

export type Step = z.infer<typeof stepSchema>
