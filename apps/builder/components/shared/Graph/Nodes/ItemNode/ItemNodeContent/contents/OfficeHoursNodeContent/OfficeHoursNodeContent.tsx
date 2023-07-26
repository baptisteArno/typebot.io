import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Comparison,
  ConditionItem,
  ComparisonOperators,
  OfficeHoursItem,
} from 'models'
import React from 'react'
import { Container } from './OfficeHours.style'

type Props = {
  item: OfficeHoursItem
}

export const OfficeHoursNodeContent = ({ item }: Props) => {
  const { typebot } = useTypebot()

  return (
    <Container>
      {item.content.values.map((value, idx) => (
        <div key={idx}>
          {value === '@OFFICE_HOURS_TRUE' && 'Dentro do expediente'}
          {value === '@OFFICE_HOURS_FALSE' && 'Fora do expediente'}
        </div>
      ))}
    </Container>
  )
}
