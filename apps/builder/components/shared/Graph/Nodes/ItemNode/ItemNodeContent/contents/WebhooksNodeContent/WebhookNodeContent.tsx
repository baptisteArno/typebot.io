import { WebhookItem } from 'models'
import React from 'react'
import { Container, SelectedCalendar } from './Webhook.style'

type Props = {
  item: WebhookItem
}

export const WebhookNodeContent = ({ item }: Props) => {

  return (
    <Container>
      {item.content.values.map((value) => (
        <>
        {value === "@CONDITIONAL_TRUE" && "Se a regra for válida, ir para"}
        {value === "@CONDITIONAL_FALSE" && "Se a regra não for válida, ir para"}
        </>
      ))}
    </Container>
  )
}
