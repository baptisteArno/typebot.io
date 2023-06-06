import { Item, ItemIndices, ItemType, Step, BaseOctaOptions } from 'models'
import React from 'react'
import { ButtonNodeContent } from './contents/ButtonNodeContent'
import { ConditionNodeContent } from './contents/ConditionNodeContent'
import { OfficeHoursNodeContent } from './contents/OfficeHoursNodeContent'
import { WebhookNodeContent } from './contents/WebhooksNodeContent/WebhookNodeContent'
import { WhatsAppOptionsNodeContent } from './contents/WhatsAppOptionsContent'

type Props = {
  step?: Step
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({ item, indices, isMouseOver, step }: Props) => {
  // console.log('ItemNodeContent (chama o WhatsNode)', item)
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
    case ItemType.WEBHOOK:
      return <WebhookNodeContent item={item} />
    case ItemType.WHATSAPP_OPTIONS_LIST:
      return (
        <WhatsAppOptionsNodeContent
          item={item}
          step={step}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    default:
      return <></>
  }
}
