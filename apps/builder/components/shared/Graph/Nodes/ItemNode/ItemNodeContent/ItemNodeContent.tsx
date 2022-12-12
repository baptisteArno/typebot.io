import { Item, ItemIndices, ItemType } from 'models'
import React from 'react'
import { ButtonNodeContent } from './contents/ButtonNodeContent'
import { ConditionNodeContent } from './contents/ConditionNodeContent'
import { OfficeHoursNodeContent } from './contents/OfficeHoursNodeContent'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({ item, indices, isMouseOver }: Props) => {
    switch (item.type) {
    case ItemType.BUTTON:
      return (
        <ButtonNodeContent
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case ItemType.CONDITION:
      return <ConditionNodeContent item={item} />
    case ItemType.OFFICE_HOURS:
        return <OfficeHoursNodeContent item={item} />
    default:
      return <></>
  }
}
