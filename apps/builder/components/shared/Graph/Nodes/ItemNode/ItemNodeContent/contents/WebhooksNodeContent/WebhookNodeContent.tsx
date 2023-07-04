import { WebhookItem } from 'models'
import React from 'react'
import { Container } from './Webhook.style'

type Props = {
  item: WebhookItem
}

export const WebhookNodeContent = ({ item }: Props) => {

  return (
    <Container>
      <ul style={{listStyle: "none"}}>
        {item.content.values.map((value, idx) =>
          <li key={idx}>
            {value.includes('HTTP_STATUS_CODE_SUCCESS') && "Se a regra for válida, ir para"}
            {value.includes('HTTP_STATUS_CODE_CLIENT_ERROR') && "Se a regra não for válida, ir para"}
          </li>
        )}
      </ul>
    </Container>
  )
}
