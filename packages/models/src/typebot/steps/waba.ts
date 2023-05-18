import { CommerceOptions, StepBase } from '.'
import { TElement } from '@udecode/plate-core'

export type WabaStep =
  | OptionsWabaStep
  | ButtonsWabaStep
  | OctaCommerceStep

export enum WabaStepType {
  OPTIONS = 'options',
  BUTTONS = 'buttons',
  COMMERCE = 'commerce'
}

export type WabaStepContent =
  | OptionsWabaContent
  | ButtonsWabaContent
  | OctaCommerceStep

export type OptionsWabaStep = StepBase & {
  type: WabaStepType.OPTIONS
  content: OptionsWabaContent
}

export type ButtonsWabaStep = StepBase & {
  type: WabaStepType.BUTTONS
  content: ButtonsWabaContent
}

export type OctaCommerceStep = StepBase & {
  type: WabaStepType.COMMERCE
  options: CommerceOptions
}

// export type OctaCommerceContent = StepBase & {
//   catalogId: string;
//   products: Array<String>;
// }

export type OptionsWabaContent = {
  labels: { placeholder: string; button: string }
}

export type ButtonsWabaContent = {
  labels: { placeholder: string; button: string }
}


// mudar

const defaultButtonLabel = 'Enviar'

export const defaultRequestOptions: OptionsWabaContent = {
  labels: { button: defaultButtonLabel, placeholder: 'Digite o número options...' },
}

export const defaultRequestButtons: ButtonsWabaContent = {
  labels: { button: defaultButtonLabel, placeholder: 'Digite o número buttons...' },
}
