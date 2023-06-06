// import { StepBase } from '.'
// import { TElement } from '@udecode/plate-core'

// export type WabaStep =
//   | OctaOptionsListWabaStep
//   | ButtonsWabaStep
//   | OctaCommerceStep

// export enum WabaStepType {
//   OPTIONS = 'options',
//   BUTTONS = 'buttons',
//   COMMERCE = 'commerce'
// }

// export type WabaStepContent =
//   | OctaOptionsListWabaContent
//   | ButtonsWabaContent
//   | OctaCommerceStep

// export type OctaOptionsListWabaStep = StepBase & {
//   type: WabaStepType.WHATSAPP_OPTIONS_LIST
//   content: OctaOptionsListWabaContent
// }

// export type ButtonsWabaStep = StepBase & {
//   type: WabaStepType.BUTTONS
//   content: ButtonsWabaContent
// }

// export type OctaCommerceStep = StepBase & {
//   type: WabaStepType.COMMERCE
//   content: OctaCommerceContent
// }

// export type OctaCommerceContent = StepBase & {
//   catalogId: string;
//   products: Array<String>;
// }

// export type OctaOptionsListWabaContent = {
//   labels: { placeholder: string; button: string }
// }

// export type ButtonsWabaContent = {
//   labels: { placeholder: string; button: string }
// }


// // mudar

// const defaultButtonLabel = 'Enviar'

// export const defaultRequestOptions: OctaOptionsListWabaContent = {
//   labels: { button: defaultButtonLabel, placeholder: 'Digite o número options...' },
// }

// export const defaultRequestButtons: ButtonsWabaContent = {
//   labels: { button: defaultButtonLabel, placeholder: 'Digite o número buttons...' },
// }
