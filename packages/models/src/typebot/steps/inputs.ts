import { ItemBase, ItemType, TextBubbleContent } from '.'
import { StepBase } from './steps'

export type InputStep =
  | TextInputStep
  | EmailInputStep
  | CpfInputStep
  | UrlInputStep
  | DateInputStep
  | PhoneNumberInputStep
  | ChoiceInputStep
  | PaymentInputStep
  | AskNameInputStep

export enum InputStepType {
  ASK_NAME = 'name input',
  EMAIL = 'email input',
  CPF = 'cpf input',
  URL = 'url input',
  DATE = 'date input',
  PHONE = 'phone number input',
  CHOICE = 'choice input',
  PAYMENT = 'payment input',
  TEXT = 'text input',
}

export type InputStepOptions =
  | TextInputOptions
  | NumberInputOptions
  | EmailInputOptions
  | DateInputOptions
  | UrlInputOptions
  | PhoneNumberInputOptions
  | ChoiceInputOptions
  | PaymentInputOptions
  | AskNameOptions

export type AskNameInputStep = StepBase & {
  type: InputStepType.ASK_NAME
  options: InputOptions
}

export type TextInputStep = StepBase & {
  type: InputStepType.TEXT
  options: InputOptions
}

export type EmailInputStep = StepBase & {
  type: InputStepType.EMAIL
  options: InputOptions
}

export type CpfInputStep = StepBase & {
  type: InputStepType.CPF
  options: InputOptions
}

export type UrlInputStep = StepBase & {
  type: InputStepType.URL
  options: UrlInputOptions
}

export type DateInputStep = StepBase & {
  type: InputStepType.DATE
  options: InputOptions
}

export type PhoneNumberInputStep = StepBase & {
  type: InputStepType.PHONE
  options: InputOptions
}

export type ChoiceInputStep = StepBase & {
  type: InputStepType.CHOICE
  items: ButtonItem[]
  options: ChoiceInputOptions
}

export type ButtonItem = ItemBase & {
  type: ItemType.BUTTON
  content?: string
  readonly?: boolean
  canAddItem?: boolean
}

export type PaymentInputStep = StepBase & {
  type: InputStepType.PAYMENT
  options: PaymentInputOptions
}

export type CreditCardDetails = {
  number: string
  exp_month: string
  exp_year: string
  cvc: string
}

export type OctaProperty = {
  domain: string
  name: string
  token: string
  type: string
}

type OptionBase = { variableId?: string; property?: OctaProperty }

type InputTextOptionsBase = {
  labels: { placeholder: string; button: string }
}

export type ChoiceInputOptions = InputOptions & {
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

export type CpfInputOptions = OptionBase & {
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
  defaultCountryCode?: string
}

export type InputOptions = OptionBase & {
  message?: TextBubbleContent
  useFallback: boolean
  fallbackMessages?: Array<TextBubbleContent>
  initialVariableToken?: string
}

export type TextInputOptions = OptionBase &
  InputTextOptionsBase & {
    isLong: boolean
  }

export type AskNameOptions = OptionBase &
  InputTextOptionsBase & {
    isLong: boolean
  }

export type NumberInputOptions = OptionBase &
  InputTextOptionsBase & {
    min?: number
    max?: number
    step?: number
  }

export enum PaymentProvider {
  STRIPE = 'Stripe',
}

export type PaymentInputOptions = OptionBase & {
  provider: PaymentProvider
  amount?: string
  currency: string
  credentialsId?: string
  additionalInformation?: {
    name?: string
    email?: string
    phoneNumber?: string
  }
  labels: { button: string }
}

const generateFallback = (msg: string) => {
  const obj = {
    html: `<div style="margin-left: 8px;">${msg}</div>`,
    richText: [
      {
        children: [
          {
            text: msg,
          },
        ],
        type: 'p',
      },
    ],
    plainText: msg,
  }
  return [obj, obj, obj]
}

const defaultButtonLabel = 'Enviar'

export const defaultGenericInputOptions: InputOptions = {
  message: undefined,
  useFallback: false,
  fallbackMessages: undefined,
  initialVariableToken: '',
  property: undefined,
  variableId: undefined,
}

export const defaultAskNameOptions: InputOptions = {
  message: {
    html: `<div style="margin-left: 8px;">Pode me dizer o seu nome?</div>`,
    richText: [
      {
        children: [
          {
            text: 'Pode me dizer o seu nome?',
          },
        ],
        type: 'p',
      },
    ],
    plainText: 'Pode me dizer o seu nome?',
  },
  useFallback: false,
  fallbackMessages: undefined,
  initialVariableToken: '#nome-contato',
  property: undefined,
  variableId: undefined,
}

export const defaultEmailInputOptions: InputOptions = {
  message: {
    html: `<div style="margin-left: 8px;">Pode me informar o seu email?</div>`,
    richText: [
      {
        children: [
          {
            text: 'Pode me informar o seu email?',
          },
        ],
        type: 'p',
      },
    ],
    plainText: 'Pode me informar o seu email?',
  },
  useFallback: true,
  fallbackMessages: generateFallback(
    'Esse email não parece ser válido. Você pode digitar novamente?'
  ),
  initialVariableToken: '#email-contato',
  property: undefined,
  variableId: undefined,
}

export const defaultCpfInputOptions: InputOptions = {
  message: {
    html: `<div style="margin-left: 8px;">Pode me informar o seu CPF?</div>`,
    richText: [
      {
        children: [
          {
            text: 'Pode me informar o seu CPF?',
          },
        ],
        type: 'p',
      },
    ],
    plainText: 'Pode me informar o seu CPF?',
  },
  useFallback: false,
  fallbackMessages: undefined,
  initialVariableToken: '#cpf-contato',
  property: undefined,
  variableId: undefined,
}

export const defaultUrlInputOptions: UrlInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Digite a URL...',
  },
  retryMessageContent:
    'Essa URL não parece válida. Você pode digitar novamente?',
}

export const defaultDateInputOptions: InputOptions = {
  message: undefined,
  useFallback: false,
  fallbackMessages: undefined,
  initialVariableToken: '',
  property: undefined,
  variableId: undefined,
}

export const defaultPhoneInputOptions: InputOptions = {
  message: {
    html: `<div style="margin-left: 8px;">Pode me informar o seu celular?</div>`,
    richText: [
      {
        children: [
          {
            text: 'Pode me informar o seu celular?',
          },
        ],
        type: 'p',
      },
    ],
    plainText: 'Pode me informar o seu celular?',
  },
  useFallback: true,
  fallbackMessages: generateFallback(
    'Esse número de celular não parece ser válido. Você pode digitar novamente?'
  ),
  initialVariableToken: '#tel-celular-contato',
  property: undefined,
  variableId: undefined,
}

export const defaultChoiceInputOptions: ChoiceInputOptions = {
  message: undefined,
  useFallback: true,
  fallbackMessages: generateFallback(
    'Essa opção não é válida. Escolha uma das opções disponíveis.'
  ),
  initialVariableToken: '',
  property: undefined,
  variableId: undefined,
  isMultipleChoice: false,
  buttonLabel: '',
}

export const defaultPaymentInputOptions: PaymentInputOptions = {
  provider: PaymentProvider.STRIPE,
  labels: { button: 'Pay' },
  currency: 'USD',
}
