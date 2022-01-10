import { InputStep, InputStepType } from './inputs'

export type Step = StartStep | BubbleStep | InputStep

export type BubbleStep = TextStep

export type StepType = 'start' | BubbleStepType | InputStepType

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
