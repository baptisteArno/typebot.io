/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import { Box, Checkbox, Flex } from '@chakra-ui/react'
import { Answer, Result } from 'bot-engine'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useEffect } from 'react'
import { Hooks, useRowSelect, useTable } from 'react-table'
import { parseSubmissionsColumns } from 'services/publicTypebot'
import { parseDateToReadable } from 'services/results'
import { LoadingRows } from './LoadingRows'

type SubmissionsTableProps = {
  results?: (Result & { answers: Answer[] })[]
  onNewSelection: (selection: string[]) => void
}

export const SubmissionsTable = ({
  results,
  onNewSelection,
}: SubmissionsTableProps) => {
  const { publishedTypebot } = useTypebot()
  const columns: any = React.useMemo(
    () => parseSubmissionsColumns(publishedTypebot),
    [publishedTypebot]
  )
  const data = React.useMemo(
    () =>
      (results ?? []).map((result) => ({
        createdAt: parseDateToReadable(result.createdAt),
        ...result.answers.reduce(
          (o, answer) => ({ ...o, [answer.blockId]: answer.content }),
          {}
        ),
      })),
    [results]
  )

  const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
    getTableBodyProps,
    selectedFlatRows,
  } = useTable({ columns, data }, useRowSelect, checkboxColumnHook) as any

  useEffect(() => {
    onNewSelection(selectedFlatRows.map((row: any) => row.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlatRows])

  return (
    <Flex overflowX="scroll" maxW="full" className="table-wrapper" rounded="md">
      <Box as="table" rounded="md" {...getTableProps()} w="full">
        <Box as="thead">
          {headerGroups.map((headerGroup: any) => {
            return (
              <Flex as="tr" {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any, idx: number) => {
                  return (
                    <Flex
                      py={2}
                      px={4}
                      border="1px"
                      borderColor="gray.200"
                      as="th"
                      color="gray.500"
                      fontWeight="normal"
                      textAlign="left"
                      minW={idx > 0 ? '200px' : 'unset'}
                      flex={idx > 0 ? '1' : '0'}
                      {...column.getHeaderProps()}
                    >
                      {column.render('Header')}
                    </Flex>
                  )
                })}
              </Flex>
            )
          })}
        </Box>

        <Box as="tbody" {...getTableBodyProps()}>
          {results === undefined && (
            <LoadingRows totalColumns={columns.length} />
          )}
          {rows.map((row: any) => {
            prepareRow(row)
            return (
              <Flex as="tr" {...row.getRowProps()}>
                {row.cells.map((cell: any, idx: number) => {
                  return (
                    <Flex
                      py={2}
                      px={4}
                      border="1px"
                      as="td"
                      borderColor="gray.200"
                      minW={idx > 0 ? '200px' : 'unset'}
                      {...cell.getCellProps()}
                      flex={idx > 0 ? '1' : '0'}
                    >
                      {cell.render('Cell')}
                    </Flex>
                  )
                })}
              </Flex>
            )
          })}
        </Box>
      </Box>
    </Flex>
  )
}

const checkboxColumnHook = (hooks: Hooks<any>) => {
  hooks.visibleColumns.push((columns) => [
    {
      id: 'selection',
      Header: ({ getToggleAllRowsSelectedProps }: any) => (
        <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
      ),
      Cell: ({ row }: any) => (
        <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
      ),
    },
    ...columns,
  ])
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, checked, ...rest }: any, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef: any = ref || defaultRef

    return (
      <Checkbox
        ref={resolvedRef}
        {...rest}
        isIndeterminate={indeterminate}
        isChecked={checked}
      />
    )
  }
)
