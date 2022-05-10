import { StepBase } from '.'
import { TextBubbleContent } from './bubble'

// Regular steps
export type OctaStep =
  | AssignToTeamStep

// Bubble steps (editado na árvore)
export type OctaBubbleStep =
  | EndConversationStep

// Step options (modal options) usa no OctaStep
export type OctaStepOptions =
  | AssignToTeamOptions

// Steps that has variables on the popup modal 
export type OctaStepWithOptions =
  | AssignToTeamStep

// Steps that has variables on its body
export type OctaBubbleStepContent =
  | EndConversationBubbleContent

// End conversation bubble content
export type EndConversationBubbleContent =
  |  TextBubbleContent

// Bubble step types
export enum OctaBubbleStepType {
  END_CONVERSATION = 'end conversation'
}

// Regular step types
export enum OctaStepType {
  ASSIGN_TO_TEAM = 'assign to team'
}

// Regular steps types that have options
export type OctaStepWithOptionsType = 
  | EndConversationStep

type OctaOptionBase = { variableId?: string }

export type EndConversationStep = StepBase & {
  type: OctaBubbleStepType.END_CONVERSATION
  content: TextBubbleContent
}

export type AssignToTeamStep = StepBase & {
  type: OctaStepType.ASSIGN_TO_TEAM
  options: AssignToTeamOptions
}

export type AssignToTeamOptions = BaseOctaOptions

export type BaseOctaOptions = {
  name: string | 'default'
  subject: string
  labels: { placeholder: string; button: string }
}

export const defaultAssignToTeamOptions: AssignToTeamOptions = {
  labels: { button: 'octa', placeholder: 'Type your answer...', },
  name: '',
  subject: ''
}

export const defaultEndConversationBubbleContent: EndConversationBubbleContent = {
  html: '',
  richText: [],
  plainText: '',
}