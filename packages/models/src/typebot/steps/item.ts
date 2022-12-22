import { ButtonItem, ConditionItem, OfficeHoursItem, WebhookItem } from '.'

export type Item = ButtonItem | ConditionItem | OfficeHoursItem | WebhookItem

export enum ItemType {
  BUTTON,
  CONDITION,
  OFFICE_HOURS,
  WEBHOOK
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
}
