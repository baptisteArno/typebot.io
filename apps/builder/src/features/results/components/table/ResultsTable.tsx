import {
  Box,
  Button,
  chakra,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlignLeftTextIcon } from '@/components/icons'
import { ResultHeaderCell, ResultsTablePreferences } from '@typebot.io/schemas'
import React, { useEffect, useRef, useState } from 'react'
import { LoadingRows } from './LoadingRows'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  Updater,
} from '@tanstack/react-table'
import { TableSettingsButton } from './TableSettingsButton'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SelectionToolbar } from './SelectionToolbar'
import { Row } from './Row'
import { HeaderRow } from './HeaderRow'
import { CellValueType, TableData } from '../../types'
import { IndeterminateCheckbox } from './IndeterminateCheckbox'
import { colors } from '@/lib/theme'
import { parseColumnOrder } from '../../helpers/parseColumnsOrder'
import { parseAccessor } from '../../helpers/parseAccessor'
import { HeaderIcon } from '../HeaderIcon'

type ResultsTableProps = {
  resultHeader: ResultHeaderCell[]
  data: TableData[]
  hasMore?: boolean
  preferences?: ResultsTablePreferences
  onScrollToBottom: () => void
  onLogOpenIndex: (index: number) => () => void
  onResultExpandIndex: (index: number) => () => void
}

export const ResultsTable = ({
  resultHeader,
  data,
  hasMore,
  preferences,
  onScrollToBottom,
  onLogOpenIndex,
  onResultExpandIndex,
}: ResultsTableProps) => {
  const background = useColorModeValue('white', colors.gray[900])
  const { updateTypebot } = useTypebot()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isTableScrolled, setIsTableScrolled] = useState(false)
  const bottomElement = useRef<HTMLDivElement | null>(null)
  const tableWrapper = useRef<HTMLDivElement | null>(null)

  const {
    columnsOrder,
    columnsVisibility = {},
    columnsWidth = {},
  } = {
    ...preferences,
    columnsOrder: parseColumnOrder(preferences?.columnsOrder, resultHeader),
  }

  const changeColumnOrder = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === 'function') return
    updateTypebot({
      resultsTablePreferences: {
        columnsOrder: newColumnOrder,
        columnsVisibility,
        columnsWidth,
      },
    })
  }

  const changeColumnVisibility = (
    newColumnVisibility: Record<string, boolean>
  ) => {
    if (typeof newColumnVisibility === 'function') return
    updateTypebot({
      resultsTablePreferences: {
        columnsVisibility: newColumnVisibility,
        columnsWidth,
        columnsOrder,
      },
    })
  }

  const changeColumnSizing = (
    newColumnSizing: Updater<Record<string, number>>
  ) => {
    if (typeof newColumnSizing === 'object') return
    updateTypebot({
      resultsTablePreferences: {
        columnsWidth: newColumnSizing(columnsWidth),
        columnsVisibility,
        columnsOrder,
      },
    })
  }

  const columns = React.useMemo<ColumnDef<TableData>[]>(
    () => [
      {
        id: 'select',
        enableResizing: false,
        maxSize: 40,
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      ...resultHeader.map<ColumnDef<TableData>>((header) => ({
        id: header.id,
        accessorKey: parseAccessor(header.label),
        size: 200,
        header: () => (
          <HStack overflow="hidden" data-testid={`${header.label} header`}>
            <HeaderIcon header={header} />
            <Text>{header.label}</Text>
          </HStack>
        ),
        cell: (info) => {
          const value = info?.getValue() as CellValueType | undefined
          if (!value) return
          return value.element || value.plainText || ''
        },
      })),
      {
        id: 'logs',
        enableResizing: false,
        maxSize: 110,
        header: () => (
          <HStack>
            <AlignLeftTextIcon />
            <Text>Logs</Text>
          </HStack>
        ),
        cell: ({ row }) => (
          <Button size="sm" onClick={onLogOpenIndex(row.index)}>
            See logs
          </Button>
        ),
      },
    ],
    [onLogOpenIndex, resultHeader]
  )

  const instance = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility: columnsVisibility,
      columnOrder: columnsOrder,
      columnSizing: columnsWidth,
    },
    getRowId: (row) => row.id.plainText,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: changeColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (!bottomElement.current) return
    const options: IntersectionObserverInit = {
      root: tableWrapper.current,
      threshold: 0,
    }
    const observer = new IntersectionObserver(handleObserver, options)
    if (bottomElement.current) observer.observe(bottomElement.current)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomElement.current])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting) onScrollToBottom()
  }

  return (
    <Stack maxW="1600px" px="4" overflowY="hidden" spacing={6}>
      <HStack w="full" justifyContent="flex-end">
        <SelectionToolbar
          selectedResultsId={Object.keys(rowSelection)}
          onClearSelection={() => setRowSelection({})}
        />
        <TableSettingsButton
          resultHeader={resultHeader}
          columnVisibility={columnsVisibility}
          setColumnVisibility={changeColumnVisibility}
          columnOrder={columnsOrder}
          onColumnOrderChange={changeColumnOrder}
        />
      </HStack>
      <Box
        ref={tableWrapper}
        overflow="scroll"
        rounded="md"
        data-testid="results-table"
        backgroundImage={`linear-gradient(to right, ${background}, ${background}), linear-gradient(to right, ${background}, ${background}),linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0)),linear-gradient(to left, rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0));`}
        backgroundPosition="left center, right center, left center, right center"
        backgroundRepeat="no-repeat"
        backgroundSize="30px 100%, 30px 100%, 15px 100%, 15px 100%"
        backgroundAttachment="local, local, scroll, scroll"
        onScroll={(e) =>
          setIsTableScrolled((e.target as HTMLElement).scrollTop > 0)
        }
      >
        <chakra.table rounded="md">
          <thead>
            {instance.getHeaderGroups().map((headerGroup) => (
              <HeaderRow
                key={headerGroup.id}
                headerGroup={headerGroup}
                isTableScrolled={isTableScrolled}
              />
            ))}
          </thead>

          <tbody>
            {instance.getRowModel().rows.map((row, rowIndex) => (
              <Row
                row={row}
                key={row.id}
                bottomElement={
                  rowIndex === data.length - 10 ? bottomElement : undefined
                }
                isSelected={row.getIsSelected()}
                onExpandButtonClick={onResultExpandIndex(rowIndex)}
              />
            ))}
            {hasMore === true && (
              <LoadingRows
                totalColumns={
                  resultHeader.filter(
                    (header) => columnsVisibility[header.id] !== false
                  ).length + 1
                }
              />
            )}
          </tbody>
        </chakra.table>
      </Box>
    </Stack>
  )
}
