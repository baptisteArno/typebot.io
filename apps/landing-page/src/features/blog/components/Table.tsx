import { Table as ChakraTable } from "@chakra-ui/react";

type Props = {
  headers: string[];
  rows: string[][];
};

export const Table = ({ headers, rows }: Props) => (
  <ChakraTable.Root maxW="60rem">
    <ChakraTable.Header>
      <ChakraTable.Row>
        {headers.map((header, index) => (
          <ChakraTable.ColumnHeader key={index}>
            {header}
          </ChakraTable.ColumnHeader>
        ))}
      </ChakraTable.Row>
    </ChakraTable.Header>
    <ChakraTable.Body>
      {rows.map((row, index) => (
        <ChakraTable.Row key={index}>
          {row.map((cell, cellIndex) => (
            <ChakraTable.Cell key={cellIndex}>{cell}</ChakraTable.Cell>
          ))}
        </ChakraTable.Row>
      ))}
    </ChakraTable.Body>
  </ChakraTable.Root>
);
