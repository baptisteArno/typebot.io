import {
  Badge,
  Box,
  Button,
  chakra,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  TextProps,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlignLeftTextIcon, SearchIcon, CopyIcon, EyeIcon } from '@/components/icons'
import {
  CellValueType,
  ResultHeaderCell,
  ResultsTablePreferences,
  ResultWithAnswers,
  TableData,
} from '@typebot.io/schemas'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { IndeterminateCheckbox } from './IndeterminateCheckbox'
import { colors } from '@/lib/theme'
import { HeaderIcon } from '../HeaderIcon'
import { parseColumnsOrder } from '@typebot.io/results/parseColumnsOrder'
import { TimeFilterDropdown } from '@/features/analytics/components/TimeFilterDropdown'
import { timeFilterValues } from '@/features/analytics/constants'

const columnHeaderProps: TextProps = {
  fontWeight: 'semibold',
  fontSize: 'xs',
  textTransform: 'uppercase',
  letterSpacing: 'wider',
  color: 'gray.500',
}

const statusConfig: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  completed: {
    label: 'Completo',
    bg: 'green.50',
    color: 'green.700',
    dot: 'green.400',
  },
  error: {
    label: 'Erro',
    bg: 'red.50',
    color: 'red.700',
    dot: 'red.400',
  },
  abandoned: {
    label: 'Abandonado',
    bg: 'purple.50',
    color: 'purple.700',
    dot: 'purple.400',
  },
}

const resolveDisplayStatus = (status: string): string => {
  if (status === 'completed' || status === 'error') return status
  return 'abandoned'
}

type ResultsTableProps = {
  resultHeader: ResultHeaderCell[]
  data: TableData[]
  results: ResultWithAnswers[]
  hasMore?: boolean
  preferences?: ResultsTablePreferences
  timeFilter: (typeof timeFilterValues)[number]
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void
  onScrollToBottom: () => void
  onLogOpenIndex: (index: number) => () => void
  onResultExpandIndex: (index: number) => () => void
  onFlowReplayIndex: (index: number) => () => void
  helpdeskIdFilter: string
  onHelpdeskIdFilterChange: (value: string) => void
}

export const ResultsTable = ({
  resultHeader,
  data,
  results,
  hasMore,
  preferences,
  timeFilter,
  onTimeFilterChange,
  onScrollToBottom,
  onLogOpenIndex,
  onResultExpandIndex,
  onFlowReplayIndex,
  helpdeskIdFilter,
  onHelpdeskIdFilterChange,
}: ResultsTableProps) => {
  const background = useColorModeValue('white', colors.gray[900])
  const inputBg = useColorModeValue('white', 'gray.800')
  const inputBorder = useColorModeValue('gray.200', 'gray.600')
  const tableBorder = useColorModeValue('gray.200', 'gray.700')
  const { updateTypebot, currentUserMode } = useTypebot()
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
    columnsOrder: parseColumnsOrder(preferences?.columnsOrder, resultHeader),
  }

  const changeColumnOrder = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === 'function') return
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsOrder: newColumnOrder,
          columnsVisibility,
          columnsWidth,
        },
      },
    })
  }

  const changeColumnVisibility = (
    newColumnVisibility: Record<string, boolean>
  ) => {
    if (typeof newColumnVisibility === 'function') return
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsVisibility: newColumnVisibility,
          columnsWidth,
          columnsOrder,
        },
      },
    })
  }

  const changeColumnSizing = (
    newColumnSizing: Updater<Record<string, number>>
  ) => {
    if (typeof newColumnSizing === 'object') return
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsWidth: newColumnSizing(columnsWidth),
          columnsVisibility,
          columnsOrder,
        },
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
      {
        id: '__helpdeskId',
        enableResizing: false,
        maxSize: 220,
        header: () => <Text {...columnHeaderProps}>Helpdesk ID</Text>,
        cell: ({ row }) => {
          const result = results[row.index]
          const helpdeskId = result?.helpdeskId
          if (!helpdeskId) return <Text color="gray.300">—</Text>
          return (
            <HStack spacing="1">
              <Text fontSize="sm" fontWeight="medium" fontFamily="mono" color="gray.700" isTruncated maxW="160px">
                {helpdeskId}
              </Text>
              <Tooltip label="Copiar" hasArrow placement="top">
                <IconButton
                  aria-label="Copiar helpdesk ID"
                  icon={<CopyIcon />}
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'blue.500' }}
                  onClick={() => navigator.clipboard.writeText(helpdeskId)}
                />
              </Tooltip>
            </HStack>
          )
        },
      },
      ...resultHeader.map<ColumnDef<TableData>>((header) => ({
        id: header.id,
        accessorKey: header.id,
        size: 200,
        header: () => (
          <HStack overflow="hidden" data-testid={`${header.label} header`}>
            <HeaderIcon header={header} />
            <Text {...columnHeaderProps}>{header.label}</Text>
          </HStack>
        ),
        cell: (info) => {
          const value = info?.getValue() as CellValueType | undefined
          if (!value) return
          return value.element || value.plainText || ''
        },
      })),
      {
        id: '__visitedBlocksCount',
        enableResizing: false,
        maxSize: 120,
        header: () => <Text {...columnHeaderProps}>Caminho</Text>,
        cell: ({ row }) => {
          const result = results[row.index]
          const blocks = Array.isArray(result?.visitedBlocks)
            ? result.visitedBlocks
            : []
          return (
            <HStack spacing="1">
              <Box w="6px" h="6px" rounded="full" bg="blue.300" />
              <Text fontSize="sm" color="gray.600">
                {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          )
        },
      },
      {
        id: '__status',
        enableResizing: false,
        maxSize: 140,
        header: () => <Text {...columnHeaderProps}>Status</Text>,
        cell: ({ row }) => {
          const result = results[row.index]
          const rawStatus = result?.status ?? 'abandoned'
          const displayStatus = resolveDisplayStatus(rawStatus)
          const cfg = statusConfig[displayStatus] ?? statusConfig.abandoned
          return (
            <Badge
              bg={cfg.bg}
              color={cfg.color}
              px="2.5"
              py="1"
              rounded="full"
              fontSize="xs"
              fontWeight="semibold"
              display="flex"
              alignItems="center"
              gap="1.5"
              w="fit-content"
            >
              <Box w="6px" h="6px" rounded="full" bg={cfg.dot} />
              {cfg.label}
            </Badge>
          )
        },
      },
      {
        id: 'logs',
        enableResizing: false,
        maxSize: 110,
        header: () => <Text {...columnHeaderProps}>Logs</Text>,
        cell: ({ row }) => (
          <Button
            size="xs"
            variant="ghost"
            color="gray.500"
            fontWeight="medium"
            leftIcon={<AlignLeftTextIcon />}
            _hover={{ bg: 'gray.100', color: 'gray.700' }}
            onClick={onLogOpenIndex(row.index)}
          >
            Ver logs
          </Button>
        ),
      },
      {
        id: '__flowReplay',
        enableResizing: false,
        maxSize: 130,
        header: () => <Text {...columnHeaderProps}>Fluxo</Text>,
        cell: ({ row }) => (
          <Button
            size="xs"
            variant="outline"
            colorScheme="blue"
            fontWeight="medium"
            leftIcon={<EyeIcon />}
            rounded="full"
            onClick={onFlowReplayIndex(row.index)}
          >
            Ver fluxo
          </Button>
        ),
      },
    ],
    [onLogOpenIndex, onFlowReplayIndex, resultHeader, results]
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

  const handleObserver = useCallback(
    (entities: IntersectionObserverEntry[]) => {
      const target = entities[0]
      if (target.isIntersecting) onScrollToBottom()
    },
    [onScrollToBottom]
  )

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
  }, [handleObserver, bottomElement.current])

  return (
    <Stack maxW="1600px" px="4" overflowY="hidden" spacing={4}>
      <Flex
        w="full"
        justify="space-between"
        align="center"
        py="2"
        gap="3"
        flexWrap="wrap"
      >
        <HStack spacing="3" flex="1" minW="0">
          <InputGroup size="sm" maxW="280px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" boxSize="3.5" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por helpdeskId..."
              value={helpdeskIdFilter}
              onChange={(e) => onHelpdeskIdFilterChange(e.target.value)}
              rounded="lg"
              bg={inputBg}
              borderColor={inputBorder}
              fontSize="sm"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
            />
          </InputGroup>
          {currentUserMode === 'write' && (
            <SelectionToolbar
              selectedResultsId={Object.keys(rowSelection)}
              onClearSelection={() => setRowSelection({})}
            />
          )}
        </HStack>
        <HStack spacing="2">
          <TimeFilterDropdown
            timeFilter={timeFilter}
            onTimeFilterChange={onTimeFilterChange}
            size="sm"
          />
          <TableSettingsButton
            resultHeader={resultHeader}
            columnVisibility={columnsVisibility}
            setColumnVisibility={changeColumnVisibility}
            columnOrder={columnsOrder}
            onColumnOrderChange={changeColumnOrder}
          />
        </HStack>
      </Flex>

      <Box
        ref={tableWrapper}
        overflow="auto"
        rounded="xl"
        border="1px solid"
        borderColor={tableBorder}
        data-testid="results-table"
        bg={background}
        onScroll={(e) =>
          setIsTableScrolled((e.target as HTMLElement).scrollTop > 0)
        }
      >
        <chakra.table w="full">
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
