import { Button, Fade, Flex, IconButton, Stack } from '@chakra-ui/react'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { DropdownList } from 'components/shared/DropdownList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { ExtractingCell, Table, Variable } from 'models'
import React, { useEffect, useState } from 'react'
import { Sheet } from 'services/integrations'
import { generate } from 'short-uuid'
import { useImmer } from 'use-immer'

type Props = {
  sheet: Sheet
  initialCells?: Table<ExtractingCell>
  onCellsChange: (cells: Table<ExtractingCell>) => void
}

const id = generate()
const defaultCells: Table<ExtractingCell> = {
  byId: { [id]: {} },
  allIds: [id],
}

export const ExtractCellList = ({
  sheet,
  initialCells,
  onCellsChange,
}: Props) => {
  const [cells, setCells] = useImmer(initialCells ?? defaultCells)
  const [showDeleteId, setShowDeleteId] = useState<string | undefined>()

  useEffect(() => {
    onCellsChange(cells)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells])

  const createCell = () => {
    setCells((cells) => {
      const id = generate()
      cells.byId[id] = {}
      cells.allIds.push(id)
    })
  }

  const updateCell = (cellId: string, updates: Partial<ExtractingCell>) =>
    setCells((cells) => {
      cells.byId[cellId] = {
        ...cells.byId[cellId],
        ...updates,
      }
    })

  const deleteCell = (cellId: string) => () => {
    setCells((cells) => {
      delete cells.byId[cellId]
      const index = cells.allIds.indexOf(cellId)
      if (index !== -1) cells.allIds.splice(index, 1)
    })
  }

  const handleMouseEnter = (cellId: string) => () => {
    setShowDeleteId(cellId)
  }

  const handleCellChange = (cellId: string) => (cell: ExtractingCell) =>
    updateCell(cellId, cell)

  const handleMouseLeave = () => setShowDeleteId(undefined)

  return (
    <Stack spacing="4">
      {cells.allIds.map((cellId) => (
        <>
          <Flex
            pos="relative"
            onMouseEnter={handleMouseEnter(cellId)}
            onMouseLeave={handleMouseLeave}
          >
            <CellWithVariableIdStack
              key={cellId}
              cell={cells.byId[cellId]}
              columns={sheet.columns}
              onCellChange={handleCellChange(cellId)}
            />
            <Fade in={showDeleteId === cellId}>
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove cell"
                onClick={deleteCell(cellId)}
                pos="absolute"
                left="-15px"
                top="-15px"
                size="sm"
                shadow="md"
              />
            </Fade>
          </Flex>
        </>
      ))}
      <Button
        leftIcon={<PlusIcon />}
        onClick={createCell}
        flexShrink={0}
        colorScheme="blue"
      >
        Add a value
      </Button>
    </Stack>
  )
}

export const CellWithVariableIdStack = ({
  cell,
  columns,
  onCellChange,
}: {
  cell: ExtractingCell
  columns: string[]
  onCellChange: (cell: ExtractingCell) => void
}) => {
  const handleColumnSelect = (column: string) => {
    onCellChange({ ...cell, column })
  }
  const handleVariableIdChange = (variable: Variable) => {
    onCellChange({ ...cell, variableId: variable.id })
  }
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList<string>
        currentItem={cell.column}
        onItemSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <VariableSearchInput
        initialVariableId={cell.variableId}
        onSelectVariable={handleVariableIdChange}
        placeholder="Select a variable"
      />
    </Stack>
  )
}
