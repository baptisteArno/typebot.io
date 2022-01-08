export type Step = StartStep | BubbleStep | InputStep

export type BubbleStep = TextStep

export type InputStep = TextInputStep | NumberInputStep

export type StepType = 'start' | BubbleStepType | InputStepType

export enum BubbleStepType {
  TEXT = 'text',
}

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
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

export type TextInputStep = StepBase & {
  type: InputStepType.TEXT
  options?: TextInputOptions
}

export type NumberInputStep = StepBase & {
  type: InputStepType.NUMBER
  options?: NumberInputOptions
}

type InputOptionsBase = {
  labels?: { placeholder?: string; button?: string }
}

export type TextInputOptions = InputOptionsBase & {
  isLong?: boolean
}

export type NumberInputOptions = InputOptionsBase & {
  min?: number
  max?: number
  step?: number
}

export type Target = { blockId: string; stepId?: string }
