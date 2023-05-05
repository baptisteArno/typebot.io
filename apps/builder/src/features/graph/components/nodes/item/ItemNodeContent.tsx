import { ButtonsItemNode } from '@/features/blocks/inputs/buttons/components/ButtonsItemNode'
import { PictureChoiceItemNode } from '@/features/blocks/inputs/pictureChoice/components/PictureChoiceItemNode'
import { ConditionItemNode } from '@/features/blocks/logic/condition/components/ConditionItemNode'
import { Item, ItemIndices, ItemType } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({
  item,
  indices,
  isMouseOver,
}: Props): JSX.Element => {
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
    case ItemType.PICTURE_CHOICE:
      return (
        <PictureChoiceItemNode
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
    case ItemType.AB_TEST:
      return <></>
  }
}
