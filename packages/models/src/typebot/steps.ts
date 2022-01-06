export type Step = StartStep | BubbleStep | InputStep

export type BubbleStep = TextStep

export type InputStep = TextInputStep

export enum StepType {
  START = 'start',
  TEXT = 'text',
  TEXT_INPUT = 'text input',
}

export type StepBase = { id: string; blockId: string; target?: Target }

export type StartStep = StepBase & {
  type: StepType.START
  label: string
}

export type TextStep = StepBase & {
  type: StepType.TEXT
  content: { html: string; richText: unknown[]; plainText: string }
}

export type TextInputStep = StepBase & {
  type: StepType.TEXT_INPUT
}

export type Target = { blockId: string; stepId?: string }
