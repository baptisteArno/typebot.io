import {
  BubbleStepType,
  InputStepType,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
  Step,
} from 'models'
import { isBubbleStepType, isInputStep } from 'utils'
import { z } from 'zod'

export enum VALIDATION_MESSAGE_TYPE {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export type ValidationMessage = {
  type: VALIDATION_MESSAGE_TYPE
  message: Array<string>
}

const runStringValidation = ({ max, min }: any) => {
  return z.object({
    message: z
      .string()
      .trim()
      .min(
        min?.value || 1,
        min?.message || 'Preencha todos os campos obrigatórios'
      )
      .max(max?.value || 500, max?.message || 'Máximo de 500 caracteres'),
  })
}

const inpuStepsWithFallbackMessages = [InputStepType.EMAIL, InputStepType.PHONE]

export const getValidationMessages = (step: Step): Array<ValidationMessage> => {
  try {
    const data = []

    if (isInputStep(step) || OctaWabaStepType.COMMERCE === step.type) {
      data.push({
        message: step?.options?.message?.plainText,
      })

      if (inpuStepsWithFallbackMessages.includes(step.type)) {
        step?.options?.fallbackMessages?.forEach((fallbackMessage) => {
          data.push({
            message: fallbackMessage?.plainText,
          })
        })
      }

      if (step.type === InputStepType.CHOICE) {
        step?.items?.forEach((item) => {
          data.push({
            message: item?.content,
          })
        })
      }
    }
    if (isBubbleStepType(step.type)) {
      if (BubbleStepType.MEDIA === step.type) {
        data.push({
          message: step?.content?.message?.plainText,
          min: { value: -1 },
        })
      } else {
        data.push({
          message: step?.content?.plainText,
        })
      }
    }

    if (
      OctaWabaStepType.WHATSAPP_OPTIONS_LIST === step.type ||
      OctaWabaStepType.WHATSAPP_BUTTONS_LIST === step.type
    ) {
      data.push({
        message: step?.options?.body?.content?.plainText,
        max: { value: 1024 },
      })
      if (OctaWabaStepType.WHATSAPP_OPTIONS_LIST === step.type) {
        data.push({
          message: step?.options?.listTitle?.content?.plainText,
        })
      }
    }

    if (OctaStepType.ASSIGN_TO_TEAM === step.type) {
      data.push(
        {
          message: step?.options?.messages?.firstMessage?.content?.plainText,
          min: { value: -1 },
        },
        {
          message:
            step?.options?.messages?.noAgentAvailable?.content?.plainText,
          min: { value: -1 },
        },
        {
          message:
            step?.options?.messages?.connectionSuccess?.content?.plainText,
          min: { value: -1 },
        }
      )
    }
    if (OctaBubbleStepType.END_CONVERSATION === step.type) {
      data.push({
        message: step?.content?.plainText,
        min: { value: -1 },
      })
    }

    data.map((d) => {
      return runStringValidation({ min: d?.min, max: d?.max }).parse({
        message: d.message || '',
      })
    })
    return []
  } catch (err) {
    const validationError = JSON.parse(err.message)[0]
    return [
      {
        type: VALIDATION_MESSAGE_TYPE.WARNING,
        message: [validationError.message],
      },
    ]
  }
}
