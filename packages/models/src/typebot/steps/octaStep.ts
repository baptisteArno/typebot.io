import {
  StepBase,
  StepWithItems,
  ItemBase,
  Step,
  ItemType,
  OctaProperty,
} from '.'
import { TextBubbleContent, WOZStepType } from './bubble'

// Regular steps
export type OctaStep =
  | AssignToTeamStep
  | OfficeHourStep
  | CallOtherBotStep
  | PreReserveStep
  | CommerceStep
  | ConversationTagStep

// Waba steps

export type OctaWabaStep = WhatsAppOptionsListStep | WhatsAppButtonsListStep

export type WOZStep = WOZSuggestionStep | WOZAssignStep

// Bubble steps (editado na árvore)
export type OctaBubbleStep = EndConversationStep

// Step options (modal options) usa no OctaStep
export type OctaStepOptions =
  | AssignToTeamOptions
  | OfficeHoursOptions
  | CallOtherBotOptions
  | PreReserveOptions
  | CommerceOptions
  | ConversationTagOptions

export type OctaWabaStepOptions =
  | WhatsAppOptionsListOptions
  | WhatsAppButtonsListOptions
  | CommerceOptions

// Steps that has variables on the popup modal
export type OctaStepWithOptions =
  | AssignToTeamStep
  | OfficeHourStep
  | CallOtherBotStep
  | PreReserveStep
  | ConversationTagStep

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
  CALL_OTHER_BOT = 'call other bot',
  PRE_RESERVE = 'pre reserve',
  CONVERSATION_TAG = 'conversation tag',
}

// Waba step types
export enum OctaWabaStepType {
  WHATSAPP_OPTIONS_LIST = 'whatsapp options list',
  WHATSAPP_BUTTONS_LIST = 'whatsapp buttons list',
  COMMERCE = 'commerce',
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

export type WOZSuggestionStep = StepBase & {
  type: WOZStepType.MESSAGE
  options: WOZSuggestionOptions
}

export type WOZAssignStep = StepBase & {
  type: WOZStepType.ASSIGN
  options: WOZAssignOptions
  items: []
}

export type ConversationTagStep = StepBase & {
  type: OctaStepType.CONVERSATION_TAG
  options: ConversationTagOptions
}

export type PreReserveStep = StepBase & {
  type: OctaStepType.PRE_RESERVE
  options: PreReserveOptions
}

export type CommerceStep = StepBase & {
  type: OctaWabaStepType.COMMERCE
  options: CommerceOptions
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
  options: OfficeHoursOptions
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

export type CommerceOptions = BaseOctaOptions & {
  catalogId: string
  products: Array<string>
  property: OctaProperty
  variableId: string
  message?: TextBubbleContent
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
  labels: {
    placeholder: { assignToTeam: string; connectionMessage: string }
    button: string
  }
}

export type PreReserveOptions = BaseOctaOptions & {
  assignTo: string
  assignType: string
}

export type ConversationTagOptions = {
  tags: Array<{
    _id: string
    name: string
  }>
}

export type WOZSuggestionOptions = BaseOctaOptions & {
  preferredAnswer?: string
}

export type WOZAssignOptions = BaseOctaOptions & {
  virtualAgentId?: string
  introduceAsIA: boolean
  confirmContext: boolean
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
  property: OctaProperty
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
  property: OctaProperty
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
  isAvailable: false,
}

export const defaultPreReserveOptions: PreReserveOptions = {
  assignTo: '',
  assignType: '',
  name: '',
  subject: '',
}

export const defaultConversationTagOptions: ConversationTagOptions = {
  tags: [
    {
      _id: '',
      name: '',
    },
  ],
}

export const defaultWOZSuggestionOptions: WOZSuggestionOptions = {
  preferredAnswer: '',
  name: '',
  subject: '',
}

export const defaultWOZAssignOptions: WOZAssignOptions = {
  name: '',
  subject: '',
  virtualAgentId: undefined,
  introduceAsIA: true,
  confirmContext: false,
}

export const defaultCallOtherBotOptions: CallOtherBotOptions = {
  id: '',
  botToCall: '',
  name: '',
  subject: '',
}

const seeYa = 'Até mais!'
export const defaultEndConversationBubbleContent: EndConversationBubbleContent =
  {
    html: `<div style="margin-left: 8px;">${seeYa}</div>`,
    richText: [
      {
        children: [
          {
            text: seeYa,
          },
        ],
        type: 'p',
      },
    ],
    plainText: seeYa,
  }

export const defaultCommerceOptions: CommerceOptions = {
  catalogId: '',
  products: [],
  property: {
    domain: '',
    name: '',
    token: '',
    type: '',
  },
  variableId: '',
  name: '',
  subject: '',
  message: {
    html: `<div style="margin-left: 8px;">Este é o catálogo que selecionamos para você:</div>`,
    richText: [
      {
        children: [
          {
            text: 'Este é o catálogo que selecionamos para você:',
          },
        ],
        type: 'p',
      },
    ],
    plainText: 'Este é o catálogo que selecionamos para você:',
  },
}

export const defaultWhatsAppOptionsListOptions: WhatsAppOptionsListOptions = {
  id: '',
  name: '',
  subject: '',
  subType: 'interactive-list',
  body: {
    content: {
      html: `<div style="margin-left: 8px;">Pergunta com lista de opções</div>`,
      richText: [
        {
          children: [
            {
              text: 'Pergunta com lista de opções',
            },
          ],
          type: 'p',
        },
      ],
      plainText: 'Pergunta com lista de opções',
    },
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
    content: {
      html: `<div style="margin-left: 8px;">Lista de opções</div>`,
      richText: [
        {
          children: [
            {
              text: 'Lista de opções',
            },
          ],
          type: 'h4',
        },
      ],
      plainText: 'Lista de opções',
    },
  },
  property: {
    domain: '',
    name: '',
    token: '',
    type: '',
  },
  variableId: '',
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
  property: {
    domain: '',
    name: '',
    token: '',
    type: '',
  },
  variableId: '',
}
