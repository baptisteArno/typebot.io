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
            {value.includes('HTTP_STATUS_CODE_SUCCESS') && "Em caso de sucesso"}
            {value.includes('HTTP_STATUS_CODE_CLIENT_ERROR') && "Em caso de falha"}
          </li>
        )}
      </ul>
    </Container>
  )
}
