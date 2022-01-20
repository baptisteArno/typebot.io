import { StepBase } from '.'

export type BubbleStep = TextBubbleStep | ImageBubbleStep

export enum BubbleStepType {
  TEXT = 'text',
  IMAGE = 'image',
}

export type TextBubbleStep = StepBase & {
  type: BubbleStepType.TEXT
  content: TextBubbleContent
}

export type ImageBubbleStep = StepBase & {
  type: BubbleStepType.IMAGE
  content?: ImageBubbleContent
}

export type TextBubbleContent = {
  html: string
  richText: unknown[]
  plainText: string
}

export type ImageBubbleContent = {
  url?: string
}
