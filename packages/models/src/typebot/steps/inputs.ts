import { Target } from '.'
import { StepBase } from './steps'

export type InputStep =
  | TextInputStep
  | NumberInputStep
  | EmailInputStep
  | UrlInputStep
  | DateInputStep
  | PhoneNumberInputStep
  | ChoiceInputStep

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
  EMAIL = 'email input',
  URL = 'url input',
  DATE = 'date input',
  PHONE = 'phone number input',
  CHOICE = 'choice input',
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

export type DateInputStep = StepBase & {
  type: InputStepType.DATE
  options?: DateInputOptions
}

export type PhoneNumberInputStep = StepBase & {
  type: InputStepType.PHONE
  options?: InputTextOptionsBase
}

export type ChoiceInputStep = StepBase & {
  type: InputStepType.CHOICE
  options: ChoiceInputOptions
}

export type ChoiceInputOptions = {
  itemIds: string[]
  isMultipleChoice?: boolean
  buttonLabel?: string
}

export type ChoiceItem = {
  id: string
  stepId: string
  content?: string
  target?: Target
}

export type DateInputOptions = {
  labels?: { button?: string; from?: string; to?: string }
  hasTime?: boolean
  isRange?: boolean
}

export type EmailInputOptions = InputTextOptionsBase

export type UrlInputOptions = InputTextOptionsBase

type InputTextOptionsBase = {
  labels?: { placeholder?: string; button?: string }
}

export type TextInputOptions = InputTextOptionsBase & {
  isLong?: boolean
}

export type NumberInputOptions = InputTextOptionsBase & {
  min?: number
  max?: number
  step?: number
}
