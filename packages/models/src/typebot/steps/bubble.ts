import { StepBase } from '.'

export type BubbleStep = TextBubbleStep | ImageBubbleStep | VideoBubbleStep

export enum BubbleStepType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

export type BubbleStepContent =
  | TextBubbleContent
  | ImageBubbleContent
  | VideoBubbleContent

export type TextBubbleStep = StepBase & {
  type: BubbleStepType.TEXT
  content: TextBubbleContent
}

export type ImageBubbleStep = StepBase & {
  type: BubbleStepType.IMAGE
  content?: ImageBubbleContent
}

export type VideoBubbleStep = StepBase & {
  type: BubbleStepType.VIDEO
  content?: VideoBubbleContent
}

export type TextBubbleContent = {
  html: string
  richText: unknown[]
  plainText: string
}

export type ImageBubbleContent = {
  url?: string
}

export enum VideoBubbleContentType {
  URL = 'url',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
}

export type VideoBubbleContent = {
  type?: VideoBubbleContentType
  url?: string
  id?: string
}
