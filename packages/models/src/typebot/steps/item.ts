import { ButtonItem, ConditionItem } from '.'

export type Item = ButtonItem | ConditionItem

export enum ItemType {
  BUTTON,
  CONDITION,
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
