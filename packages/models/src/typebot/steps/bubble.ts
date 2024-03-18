import { InputOptions, StepBase } from '.'
import { TElement } from '@udecode/plate-core'

export type BubbleStep =
  | TextBubbleStep
  | ImageBubbleStep
  | MediaBubbleStep
  | VideoBubbleStep
  | EmbedBubbleStep

export enum BubbleStepType {
  TEXT = 'text',
  IMAGE = 'image',
  MEDIA = 'media',
  VIDEO = 'video',
  EMBED = 'embed',
}

export enum WOZStepType {
  MESSAGE = 'woz message',
  ASSIGN = 'woz assign',
}

export type BubbleStepContent =
  | TextBubbleContent
  | ImageBubbleContent
  | MediaBubbleContent
  | VideoBubbleContent
  | EmbedBubbleContent

export type TextBubbleStep = StepBase & {
  type: BubbleStepType.TEXT
  content: TextBubbleContent
}

export type ImageBubbleStep = StepBase & {
  type: BubbleStepType.IMAGE
  content: ImageBubbleContent
}

export type MediaBubbleStep = StepBase & {
  type: BubbleStepType.MEDIA
  content: MediaBubbleContent
}

export type VideoBubbleStep = StepBase & {
  type: BubbleStepType.VIDEO
  content: VideoBubbleContent
}

export type EmbedBubbleStep = StepBase & {
  type: BubbleStepType.EMBED
  content: EmbedBubbleContent
}

export type TextBubbleContent = {
  html: string
  richText: TElement[]
  plainText: string
  itemId?: string
}

export type ImageBubbleContent = {
  url?: string
  name: string
  size: number
  type: string
}

export type MediaBubbleContent = InputOptions & {
  url?: string
  name: string
  size: number
  type: string
}

export type EmbedBubbleContent = {
  url?: string
  height: number
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

export const defaultTextBubbleContent: TextBubbleContent = {
  html: '',
  richText: [],
  plainText: '',
}

export const defaultImageBubbleContent: ImageBubbleContent = {
  name: '',
  size: 1,
  type: ''
}

const mediaDefaultText = 'Confira nossas opções:'
export const defaultMediaBubbleContent: MediaBubbleContent = {
  name: '',
  size: 1,
  type: 'media',
  message: {
    html: `<div style="margin-left: 8px;">${mediaDefaultText}</div>`,
    richText: [{
      children: [{
        text: mediaDefaultText,
      }],
      type: "p"
    }],
    plainText: mediaDefaultText
  },
  useFallback: false,
  fallbackMessages: undefined,
  initialVariableToken: '',
  property: undefined,
  variableId: undefined
}

export const defaultVideoBubbleContent: VideoBubbleContent = {}

export const defaultEmbedBubbleContent: EmbedBubbleContent = { height: 400 }
