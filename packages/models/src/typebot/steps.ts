export type Step = StartStep | BubbleStep | InputStep

export type BubbleStep = TextStep

export type InputStep =
  | TextInputStep
  | NumberInputStep
  | EmailInputStep
  | UrlInputStep

export type StepType = 'start' | BubbleStepType | InputStepType

export enum BubbleStepType {
  TEXT = 'text',
}

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
  EMAIL = 'email input',
  URL = 'url input',
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

export type EmailInputStep = StepBase & {
  type: InputStepType.EMAIL
  options?: EmailInputOptions
}

export type UrlInputStep = StepBase & {
  type: InputStepType.URL
  options?: UrlInputOptions
}

export type EmailInputOptions = InputOptionsBase

export type UrlInputOptions = InputOptionsBase

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
