import {
  BubbleStep,
  BubbleStepType,
  Edge,
  EmailInputStep,
  InputStepType,
  PhoneNumberInputStep,
  PublicStep,
  UrlInputStep,
  Variable,
} from 'models'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { isInputStep } from 'utils'
import { parseVariables } from './variable'

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const urlRegex =
  /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/

export const isInputValid = (
  inputValue: string,
  type: InputStepType
): boolean => {
  switch (type) {
    case InputStepType.EMAIL:
      return emailRegex.test(inputValue)
    case InputStepType.PHONE:
      return isPossiblePhoneNumber(inputValue)
    case InputStepType.URL:
      return urlRegex.test(inputValue)
  }
  return true
}

export const stepCanBeRetried = (
  step: PublicStep
): step is EmailInputStep | UrlInputStep | PhoneNumberInputStep =>
  isInputStep(step) && 'retryMessageContent' in step.options

export const parseRetryStep = (
  step: EmailInputStep | UrlInputStep | PhoneNumberInputStep,
  variables: Variable[],
  createEdge: (edge: Edge) => void
): BubbleStep => {
  const content = parseVariables(variables)(step.options.retryMessageContent)
  const newStepId = step.id + Math.random() * 1000
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { stepId: newStepId, blockId: step.blockId },
    to: { blockId: step.blockId, stepId: step.id },
  }
  createEdge(newEdge)
  return {
    blockId: step.blockId,
    id: newStepId,
    type: BubbleStepType.TEXT,
    content: {
      html: `<div>${content}</div>`,
      richText: [],
      plainText: content,
    },
    outgoingEdgeId: newEdge.id,
  }
}
