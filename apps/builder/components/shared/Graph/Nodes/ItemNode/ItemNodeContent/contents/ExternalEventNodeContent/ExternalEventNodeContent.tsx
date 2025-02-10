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
            {value.includes('EXTERNAL_EVENT_RECEIVED') && "Em caso de sucesso"}
            {value.includes('EXTERNAL_EVENT_ERROR') && "Em caso de falha"}
            {value.includes('EXTERNAL_EVENT_TIMEOUT') && "Sem resposta"}
          </li>
        )}
      </ul>
    </Container>
  )
}
