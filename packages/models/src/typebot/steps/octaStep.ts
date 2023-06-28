import { StepBase, StepWithItems, ItemBase, Step, ItemType } from '.'
import { TextBubbleContent } from './bubble'

// Regular steps
export type OctaStep = AssignToTeamStep | OfficeHourStep | CallOtherBotStep

// Waba steps

export type OctaWabaStep = WhatsAppOptionsListStep | WhatsAppButtonsListStep

// Bubble steps (editado na árvore)
export type OctaBubbleStep = EndConversationStep

// Step options (modal options) usa no OctaStep
export type OctaStepOptions =
  | AssignToTeamOptions
  | OfficeHoursOptions
  | CallOtherBotOptions

export type OctaWabaStepOptions = WhatsAppOptionsListOptions | WhatsAppButtonsListOptions

// Steps that has variables on the popup modal
export type OctaStepWithOptions =
  | AssignToTeamStep
  | OfficeHourStep
  | CallOtherBotStep

// Steps that has variables on its body
export type OctaBubbleStepContent = EndConversationBubbleContent

// End conversation bubble content
export type EndConversationBubbleContent = TextBubbleContent

// Bubble step types
export enum OctaBubbleStepType {
  END_CONVERSATION = 'end conversation',
}

// Regular step types
export enum OctaStepType {
  OFFICE_HOURS = 'office hours',
  ASSIGN_TO_TEAM = 'assign to team',
  CALL_OTHER_BOT = 'call other bot'
}

// Waba step types
export enum OctaWabaStepType {
  WHATSAPP_OPTIONS_LIST = 'whatsapp options list',
  WHATSAPP_BUTTONS_LIST = 'whatsapp buttons list',
  COMMERCE = 'commerce'
}

// Regular steps types that have options
export type OctaStepWithOptionsType = EndConversationStep

type OctaOptionBase = { variableId?: string }

export type EndConversationStep = StepBase & {
  type: OctaBubbleStepType.END_CONVERSATION
  content: TextBubbleContent
}

export type AssignToTeamStep = StepBase & {
  type: OctaStepType.ASSIGN_TO_TEAM
  options: AssignToTeamOptions
}

export type CallOtherBotStep = StepBase & {
  type: OctaStepType.CALL_OTHER_BOT
  options: CallOtherBotOptions
}

export type WhatsAppOptionsListStep = StepBase & {
  type: OctaWabaStepType.WHATSAPP_OPTIONS_LIST
  options: WhatsAppOptionsListOptions
  items: [WhatsAppOptionsItem]
}

export type WhatsAppButtonsListStep = StepBase & {
  type: OctaWabaStepType.WHATSAPP_BUTTONS_LIST
  options: WhatsAppButtonsListOptions
  items: [WhatsAppButtonsItem]
}

export type WhatsAppOptionsItem = ItemBase & {
  type: ItemType.WHATSAPP_OPTIONS_LIST
  content: WhatsAppOptionsContent
}

export type WhatsAppButtonsItem = ItemBase & {
  type: ItemType.WHATSAPP_BUTTONS_LIST
  content: WhatsAppButtonsContent
}

export type WhatsAppButtonsContent = ItemBase & {
  variableId?: string
}

export type WhatsAppOptionsContent = {
  source: string
  matchType: '$eq'
  values: Array<string>
  referenceProperty: string
  referenceValue: null
  subType: null
}

export type OfficeHourStep = StepBase & {
  type: OctaStepType.OFFICE_HOURS
  items: [OfficeHoursItem]
}

export type OfficeHoursItem = ItemBase & {
  type: ItemType.OFFICE_HOURS
  content: OfficeHoursContent
}

export type OfficeHoursContent = {
  source: string
  matchType: '$eq'
  values: Array<string>
  referenceProperty: string
  referenceValue: null
  subType: null
}

export type OfficeHoursOptions = BaseOctaOptions & {
  id: string
  presetName: string
  displayName: string
  type: string
  content: {
    applicableFor: Array<any>
    warnings: Array<any>
    delay: {
      time: number
      style: string
    }
    messages: Array<any>
    calendarId: string
    buttons: Array<{
      id: boolean
      value: string
      label: string
      selected: boolean
    }>
  }
  warning: boolean
  isOnTree: boolean
  created: Date
  _isFallback: boolean
  _isDirty: boolean
  isNew: boolean
}

// Regular options
export type AssignToTeamOptions = BaseOctaOptions & {
  assignTo: string
  assignType: string
  subType: string
  messages: {
    firstMessage?: {
      content?: TextBubbleContent
    }
    connectionSuccess?: {
      content?: TextBubbleContent
    }
    noAgentAvailable?: {
      content?: TextBubbleContent
    }
  }
  defaultArray: string
  isAvailable: boolean
  shouldRedirectNoneAvailable: boolean
  labels: {
    placeholder: { assignToTeam: string; connectionMessage: string }
    button: string
  }
}

export type CallOtherBotOptions = BaseOctaOptions & {
  id: string
  botToCall: string
}

export type Assign = {
  id: string
  variableId?: string
}

export type CallOtherBot = {
  id: string
  botToCall?: string
}

export type BaseOctaOptions = {
  name: string | 'default'
  subject: string
}

// Waba options
export type WhatsAppOptionsListOptions = BaseOctaOptions & {
  id: string
  subType: string
  body: {
    content?: TextBubbleContent
  }
  buttons: Array<any>
  header: {
    content?: TextBubbleContent
  }
  footer: {
    content?: TextBubbleContent
  }
  listTitle: {
    content?: TextBubbleContent
  }
  list: {
    actionLabel: {
      content?: TextBubbleContent
    }
  }
  listItems: Array<{
    description: string
    id: string
    label: string
    selected: boolean
    value: string
  }>
  variableId: string
}

export type WhatsAppButtonsListOptions = BaseOctaOptions & {
  id: string
  subType: string
  body: {
    content?: TextBubbleContent
  }
  header: {
    content?: TextBubbleContent
  }
  footer: {
    content?: TextBubbleContent
  }
  variableId: string
}

export const defaultOfficeHoursOptions: OfficeHoursOptions = {
  id: '',
  presetName: 'Horário de atendimento',
  displayName: 'string',
  type: 'office-hours',
  content: {
    applicableFor: [],
    warnings: [],
    delay: {
      time: 15000,
      style: '',
    },
    messages: [],
    calendarId: '',
    buttons: [],
  },
  warning: false,
  isOnTree: false,
  created: new Date(),
  _isFallback: false,
  _isDirty: false,
  isNew: false,
  name: '',
  subject: '',
}

export const defaultOfficeHoursContent: Array<OfficeHoursContent> = [
  {
    source: 'CURRENT_SESSION',
    matchType: '$eq',
    values: ['@OFFICE_HOURS_FALSE'],
    referenceProperty: '',
    referenceValue: null,
    subType: null,
  },
]

export const defaultWhatsAppOptionsListContent: any = null

export const defaultAssignToTeamOptions: AssignToTeamOptions = {
  labels: {
    button: 'octa',
    placeholder: {
      assignToTeam: 'Direcione a conversa para o time',
      connectionMessage: 'Mensagem de conexão',
    },
  },
  shouldRedirectNoneAvailable: false,
  messages: {
    firstMessage: {
      content: undefined,
    },
    connectionSuccess: {
      content: undefined,
    },
    noAgentAvailable: {
      content: undefined,
    },
  },
  defaultArray: '',
  name: '',
  subject: '',
  assignTo: '',
  assignType: '',
  subType: '',
  isAvailable: true,
}

export const defaultCallOtherBotOptions: CallOtherBotOptions = {
  id: '',
  botToCall: '',
  name: '',
  subject: '',
}

export const defaultEndConversationBubbleContent: EndConversationBubbleContent =
  {
    html: '',
    richText: [],
    plainText: '',
  }

export const defaultWhatsAppOptionsListOptions: WhatsAppOptionsListOptions = {
  id: '',
  name: '',
  subject: '',
  subType: 'interactive-list',
  body: {
    content: undefined,
  },
  buttons: [''],
  header: {
    content: undefined,
  },
  footer: {
    content: undefined,
  },
  list: {
    actionLabel: {
      content: undefined,
    },
  },
  listItems: [],
  listTitle: {
    content: undefined,
  },
  variableId: ''
}

export const defaultWhatsAppButtonsListOptions: WhatsAppButtonsListOptions = {
  id: '',
  name: '',
  subject: '',
  subType: 'interactive-buttons',
  body: {
    content: undefined,
  },
  header: {
    content: undefined,
  },
  footer: {
    content: undefined,
  },
  variableId: ''
}
