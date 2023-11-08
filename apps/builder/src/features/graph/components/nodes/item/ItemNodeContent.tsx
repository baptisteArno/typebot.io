import { ButtonsItemNode } from '@/features/blocks/inputs/buttons/components/ButtonsItemNode'
import { PictureChoiceItemNode } from '@/features/blocks/inputs/pictureChoice/components/PictureChoiceItemNode'
import { ConditionItemNode } from '@/features/blocks/logic/condition/components/ConditionItemNode'
import {
  BlockWithItems,
  ButtonItem,
  ConditionItem,
  Item,
  ItemIndices,
} from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import React from 'react'

type Props = {
  item: Item
  blockType: BlockWithItems['type']
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({
  item,
  blockType,
  indices,
  isMouseOver,
}: Props): JSX.Element => {
  switch (blockType) {
    case InputBlockType.CHOICE:
      return (
        <ButtonsItemNode
          item={item as ButtonItem}
          key={`${item.id}-${(item as ButtonItem).content}`}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case InputBlockType.PICTURE_CHOICE:
      return (
        <PictureChoiceItemNode
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case LogicBlockType.CONDITION:
      return (
        <ConditionItemNode
          item={item as ConditionItem}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case LogicBlockType.AB_TEST:
      return <></>
  }
}
