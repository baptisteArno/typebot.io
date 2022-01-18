import { StepBase } from '.'

export type BubbleStep = TextStep

export enum BubbleStepType {
  TEXT = 'text',
}

export type TextStep = StepBase & {
  type: BubbleStepType.TEXT
  content: { html: string; richText: unknown[]; plainText: string }
}
