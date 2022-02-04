import { Item, ItemIndices, ItemType } from 'models'
import React from 'react'
import { ButtonNodeContent } from './contents/ButtonNodeContent'
import { ConditionNodeContent } from './contents/ConditionNodeContent'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
  isLastItem: boolean
}

export const ItemNodeContent = ({
  item,
  indices,
  isMouseOver,
  isLastItem,
}: Props) => {
  switch (item.type) {
    case ItemType.BUTTON:
      return (
        <ButtonNodeContent
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
          isLastItem={isLastItem}
        />
      )
    case ItemType.CONDITION:
      return <ConditionNodeContent item={item} />
  }
}
