import { ButtonItem, ConditionItem, OfficeHoursItem } from '.'

export type Item = ButtonItem | ConditionItem | OfficeHoursItem

export enum ItemType {
  BUTTON,
  CONDITION,
  OFFICE_HOURS
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
