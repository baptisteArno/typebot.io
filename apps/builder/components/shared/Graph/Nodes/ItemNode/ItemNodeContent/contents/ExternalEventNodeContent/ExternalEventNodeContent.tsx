import { ExternalEventItem } from "models"
import { Container } from './ExternalEvent.style'

type Props = {
  item: ExternalEventItem
}

export const ExternalEventNodeContent = ({ item }: Props) => {
  return (
    <Container>
      <ul style={{ listStyle: "none" }}>
        {item.content.values.map((value, idx) =>
          <li key={idx}>
            {value.includes('HTTP_STATUS_CODE_SUCCESS') && "Em caso de sucesso"}
            {value.includes('HTTP_STATUS_CODE_CLIENT_ERROR') && "Em caso de falha"}
            {value.includes('HTTP_STATUS_NO_RESPONSE') && "Sem resposta"}
          </li>
        )}
      </ul>
    </Container>
  )
}
