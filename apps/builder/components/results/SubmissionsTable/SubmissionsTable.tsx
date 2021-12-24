/* eslint-disable react/jsx-key */
import { Box, Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import React from 'react'
import { useTable } from 'react-table'
import { parseSubmissionsColumns } from 'services/publicTypebot'

// eslint-disable-next-line @typescript-eslint/ban-types
type SubmissionsTableProps = {}

export const SubmissionsTable = ({}: SubmissionsTableProps) => {
  const { publishedTypebot } = useTypebot()
  const columns: any = React.useMemo(
    () => parseSubmissionsColumns(publishedTypebot),
    [publishedTypebot]
  )
  const data = React.useMemo(() => [], [])
  const { getTableProps, headerGroups, rows, prepareRow, getTableBodyProps } =
    useTable({ columns, data })
  return (
    <Flex overflowX="scroll" maxW="full" className="table-wrapper" rounded="md">
      <Box as="table" rounded="md" {...getTableProps()}>
        <Box as="thead">
          {headerGroups.map((headerGroup) => {
            return (
              <Box as="tr" {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <Box
                      py={2}
                      px={4}
                      border="1px"
                      borderColor="gray.200"
                      as="th"
                      minW="200px"
                      color="gray.500"
                      fontWeight="normal"
                      textAlign="left"
                      {...column.getHeaderProps()}
                    >
                      {column.render('Header')}
                    </Box>
                  )
                })}
              </Box>
            )
          })}
        </Box>

        <Box as="tbody" {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <Box as="tr" {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <Box
                      py={2}
                      px={4}
                      border="1px"
                      as="td"
                      minW="200px"
                      borderColor="gray.200"
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </Box>
                  )
                })}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Flex>
  )
}
