import { StepBase } from '.'

export type OctaStep =
  | SendMessageStep
  | EndConversationStep
  | AssignToTeamStep

export type OctaStepOptions =
  | SendMessageOptions
  | EndConversationOptions
  | AssignToTeamOptions

export enum OctaStepType {
  SEND_MESSAGE = 'Enviar mensagem',
  END_CONVERSATION = 'end conversation',
  ASSIGN_TO_TEAM = 'assign to team'
}

export type SendMessageStep = BaseOctaStep

export type EndConversationStep = BaseOctaStep

export type AssignToTeamStep = BaseOctaStep

export type BaseOctaStep = StepBase & {
  type: OctaStepType.END_CONVERSATION
  options: AssignToTeamOptions
}

export type SendMessageOptions = BaseOctaOptions

export type EndConversationOptions = BaseOctaOptions

export type AssignToTeamOptions = BaseOctaOptions

export type BaseOctaOptions = {
  name: string | 'default'
  subject: string
}
