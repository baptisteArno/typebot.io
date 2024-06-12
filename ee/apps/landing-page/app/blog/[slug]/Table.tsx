import {
  Table as ChakraTable,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'

type Props = {
  headers: string[]
  rows: string[][]
}

export const Table = ({ headers, rows }: Props) => (
  <TableContainer maxW="60rem">
    <ChakraTable>
      <Thead>
        <Tr>
          {headers.map((header, index) => (
            <Th key={index}>{header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, index) => (
          <Tr key={index}>
            {row.map((cell, cellIndex) => (
              <Td key={cellIndex}>{cell}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </ChakraTable>
  </TableContainer>
)
