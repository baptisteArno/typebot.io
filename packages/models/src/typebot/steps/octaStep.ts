import { StepBase, StepWithItems, ItemBase, Step, ItemType } from '.'
import { TextBubbleContent } from './bubble'

// Regular steps
export type OctaStep = AssignToTeamStep | OfficeHourStep

// Bubble steps (editado na árvore)
export type OctaBubbleStep = EndConversationStep

// Step options (modal options) usa no OctaStep
export type OctaStepOptions = AssignToTeamOptions | OfficeHoursOptions

// Steps that has variables on the popup modal
export type OctaStepWithOptions = AssignToTeamStep | OfficeHourStep

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
  ASSIGN_TO_TEAM = 'assign to team'
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

export type OfficeHourStep = StepBase & {
  type: OctaStepType.OFFICE_HOURS
  items: [OfficeHoursItem]
}


export type OfficeHoursItem = ItemBase & {
  type: ItemType.OFFICE_HOURS
  content: OfficeHoursContent
}

export type OfficeHoursContent = {
  source: string;
  matchType: "$eq";
  values: Array<string>,
  referenceProperty: string;
  referenceValue: null;
  subType: null;
}

// export type OfficeHoursContent = {
//   source: "CURRENT_SESSION";
//   matchType: "$eq";
//   values: Array<string>,
//   referenceProperty: string;
//   referenceValue: null;
//   subType: null;
// }

// export type OfficeHoursItem = ItemBase & {
//   type: ItemType.OFFICE_HOURS;
//   content: Array<OfficeHoursContent>;
// }

// export type OfficeHourStep = StepBase & {
//   type: OctaStepType.OFFICE_HOURS;
//   options: OfficeHoursOptions;
//   items: [OfficeHoursItem]
// }

export type OfficeHoursOptions = BaseOctaOptions & {
  id: string;
  presetName: string;
  displayName: string;
  type: string;
  content: {
    applicableFor: Array<any>;
    warnings: Array<any>;
    delay: {
      time: number,
      style: string
    };
    messages: Array<any>;
    calendarId: string;
    buttons: Array<{
      id: boolean;
      value: string;
      label: string;
      selected: boolean
    }>
  },
  warning: boolean;
  isOnTree: boolean;
  created: Date;
  _isFallback: boolean;
  _isDirty: boolean;
  isNew: boolean;
}

export type AssignToTeamOptions = BaseOctaOptions & {
  assignTo: string
  assignType: string
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

export type Assign = {
  id: string
  variableId?: string
}

export type BaseOctaOptions = {
  name: string | 'default'
  subject: string
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
      style: ''
    },
    messages: [],
    calendarId: '',
    buttons: []
  },
  warning: false,
  isOnTree: false,
  created: new Date(),
  _isFallback: false,
  _isDirty: false,
  isNew: false,
  name: "",
  subject: ""
}

export const defaultOfficeHoursContent: Array<OfficeHoursContent> = [
  {
    source: "CURRENT_SESSION",
    matchType: "$eq",
    values: [
      "@OFFICE_HOURS_FALSE"
    ],
    referenceProperty: "",
    referenceValue: null,
    subType: null
  }
]

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
      content: undefined
    },
    connectionSuccess: {
      content: undefined
    },
    noAgentAvailable: {
      content: undefined
    },
  },
  defaultArray: '',
  name: '',
  subject: '',
  assignTo: '',
  assignType: '',
  isAvailable: false,
}

export const defaultEndConversationBubbleContent: EndConversationBubbleContent =
{
  html: '',
  richText: [],
  plainText: '',
}
