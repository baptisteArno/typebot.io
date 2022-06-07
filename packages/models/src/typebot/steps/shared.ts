import { z } from 'zod'

export const stepBaseSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  outgoingEdgeId: z.string().optional(),
})

export const defaultButtonLabel = 'Send'

export const optionBaseSchema = z.object({
  variableId: z.string().optional(),
})

export const itemBaseSchema = z.object({
  id: z.string(),
  stepId: z.string(),
  outgoingEdgeId: z.string().optional(),
})

export enum ItemType {
  BUTTON,
  CONDITION,
}

export enum BubbleStepType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  EMBED = 'embed',
}

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
  EMAIL = 'email input',
  URL = 'url input',
  DATE = 'date input',
  PHONE = 'phone number input',
  CHOICE = 'choice input',
  PAYMENT = 'payment input',
  RATING = 'rating input',
}

export enum LogicStepType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
  REDIRECT = 'Redirect',
  CODE = 'Code',
  TYPEBOT_LINK = 'Typebot link',
}

export enum IntegrationStepType {
  GOOGLE_SHEETS = 'Google Sheets',
  GOOGLE_ANALYTICS = 'Google Analytics',
  WEBHOOK = 'Webhook',
  EMAIL = 'Email',
  ZAPIER = 'Zapier',
  MAKE_COM = 'Make.com',
  PABBLY_CONNECT = 'Pabbly',
}
