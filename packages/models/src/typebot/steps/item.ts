import { ButtonItem, ConditionItem, OfficeHoursItem, WebhookItem, WhatsAppOptionsItem, WhatsAppButtonsItem } from '.'

export type Item = ButtonItem | ConditionItem | OfficeHoursItem | WebhookItem | WhatsAppOptionsItem | WhatsAppButtonsItem

export enum ItemType {
  BUTTON,
  CONDITION,
  OFFICE_HOURS,
  WEBHOOK,
  WHATSAPP_OPTIONS_LIST,
  WHATSAPP_BUTTONS_LIST
}

export type ItemBase = {
  id: string
  stepId: string
  outgoingEdgeId?: string
}

export type ItemIndices = {
  blockIndex: number
  stepIndex: number
  itemIndex: number
  itemsCount?: number
}
