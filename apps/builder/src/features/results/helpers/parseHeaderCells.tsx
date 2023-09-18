import { HStack, Text } from '@chakra-ui/react'
import { ResultHeaderCell } from '@typebot.io/schemas'
import { HeaderIcon } from '../components/HeaderIcon'
import { HeaderCell } from '../types'

export const parseHeaderCells = (
  resultHeader: ResultHeaderCell[]
): HeaderCell[] =>
  resultHeader.map((header) => ({
    Header: (
      <HStack minW="150px" maxW="500px">
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
    ),
    accessor: header.id,
  }))
