import { StepBase } from '.'

export type OctaStep =
  | SendMessageStep
  | EndMessage

export type OctaStepOptions =
  | SendMessageOptions
  | EndMessage

export enum OctaStepType {
  SEND_MESSAGE = 'Enviar mensagem',
  END_MESSAGE = 'Finalizar conversa'
}

export type SendMessageStep = StepBase & {
  type: OctaStepType.SEND_MESSAGE
  options: SendMessageOptions
}

export type EndMessage = StepBase & {
  type: OctaStepType.END_MESSAGE
  options: EndMessageOptions
}

export type SendMessageOptions = {
  name: string | 'default'
  subject: string
}

export type EndMessageOptions = {
  name: string | 'default'
  subject: string
}
