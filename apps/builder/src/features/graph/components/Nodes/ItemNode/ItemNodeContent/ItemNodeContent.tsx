import { ButtonsItemNode } from '@/features/blocks/inputs/buttons'
import { ConditionItemNode } from '@/features/blocks/logic/condition'
import { Item, ItemIndices, ItemType } from 'models'
import React from 'react'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({ item, indices, isMouseOver }: Props) => {
  switch (item.type) {
    case ItemType.BUTTON:
      return (
        <ButtonsItemNode
          key={`${item.id}-${item.content}`}
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case ItemType.CONDITION:
      return (
        <ConditionItemNode
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
  }
}
