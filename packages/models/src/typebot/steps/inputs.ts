import { ItemBase, ItemType } from '.'
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

export type InputStepOptions =
  | TextInputOptions
  | NumberInputOptions
  | EmailInputOptions
  | DateInputOptions
  | UrlInputOptions
  | PhoneNumberInputOptions
  | ChoiceInputOptions

export type TextInputStep = StepBase & {
  type: InputStepType.TEXT
  options: TextInputOptions
}

export type NumberInputStep = StepBase & {
  type: InputStepType.NUMBER
  options: NumberInputOptions
}

export type EmailInputStep = StepBase & {
  type: InputStepType.EMAIL
  options: EmailInputOptions
}

export type UrlInputStep = StepBase & {
  type: InputStepType.URL
  options: UrlInputOptions
}

export type DateInputStep = StepBase & {
  type: InputStepType.DATE
  options: DateInputOptions
}

export type PhoneNumberInputStep = StepBase & {
  type: InputStepType.PHONE
  options: PhoneNumberInputOptions
}

export type ChoiceInputStep = StepBase & {
  type: InputStepType.CHOICE
  items: ButtonItem[]
  options: ChoiceInputOptions
}

export type ButtonItem = ItemBase & {
  type: ItemType.BUTTON
  content?: string
}

type OptionBase = { variableId?: string }

type InputTextOptionsBase = {
  labels: { placeholder: string; button: string }
}

export type ChoiceInputOptions = OptionBase & {
  isMultipleChoice: boolean
  buttonLabel: string
}

export type DateInputOptions = OptionBase & {
  labels: { button: string; from: string; to: string }
  hasTime: boolean
  isRange: boolean
}

export type EmailInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
}

export type UrlInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
}

export type PhoneNumberInputOptions = OptionBase & {
  labels: { placeholder: string; button: string }
  retryMessageContent: string
}

export type TextInputOptions = OptionBase &
  InputTextOptionsBase & {
    isLong: boolean
  }

export type NumberInputOptions = OptionBase &
  InputTextOptionsBase & {
    min?: number
    max?: number
    step?: number
  }

const defaultButtonLabel = 'Send'

export const defaultTextInputOptions: TextInputOptions = {
  isLong: false,
  labels: { button: defaultButtonLabel, placeholder: 'Type your answer...' },
}

export const defaultNumberInputOptions: NumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: 'Type a number...' },
}

export const defaultEmailInputOptions: EmailInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type your email...',
  },
  retryMessageContent:
    "This email doesn't seem to be valid. Can you type it again?",
}

export const defaultUrlInputOptions: UrlInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type a URL...',
  },
  retryMessageContent:
    "This email doesn't seem to be valid. Can you type it again?",
}

export const defaultDateInputOptions: DateInputOptions = {
  hasTime: false,
  isRange: false,
  labels: { button: defaultButtonLabel, from: 'From:', to: 'To:' },
}

export const defaultPhoneInputOptions: PhoneNumberInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type your phone number...',
  },
  retryMessageContent:
    "This email doesn't seem to be valid. Can you type it again?",
}

export const defaultChoiceInputOptions: ChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  isMultipleChoice: false,
}
