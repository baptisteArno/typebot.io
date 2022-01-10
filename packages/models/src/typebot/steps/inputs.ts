import { StepBase } from './steps'

export type InputStep =
  | TextInputStep
  | NumberInputStep
  | EmailInputStep
  | UrlInputStep
  | DateInputStep
  | PhoneNumberInputStep

export enum InputStepType {
  TEXT = 'text input',
  NUMBER = 'number input',
  EMAIL = 'email input',
  URL = 'url input',
  DATE = 'date input',
  PHONE = 'phone number input',
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
  options?: InputOptionsBase
}

export type DateInputOptions = {
  labels?: { button?: string; from?: string; to?: string }
  hasTime?: boolean
  isRange?: boolean
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
