import { InputStep, InputStepType } from './inputs'
import { LogicStep, LogicStepType } from './logic'

export type Step = StartStep | BubbleStep | InputStep | LogicStep

export type BubbleStep = TextStep

export type StepType = 'start' | BubbleStepType | InputStepType | LogicStepType

export enum BubbleStepType {
  TEXT = 'text',
}

export type StepBase = { id: string; blockId: string; target?: Target }

export type StartStep = StepBase & {
  type: 'start'
  label: string
}

export type TextStep = StepBase & {
  type: BubbleStepType.TEXT
  content: { html: string; richText: unknown[]; plainText: string }
}

export type Target = { blockId: string; stepId?: string }
