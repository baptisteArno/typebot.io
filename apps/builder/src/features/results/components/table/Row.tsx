import React, { useState } from 'react'
import { Row as RowProps } from '@tanstack/react-table'
import Cell from './Cell'
import { TableData } from '@typebot.io/schemas'
import { chakra, useColorModeValue } from '@chakra-ui/react'

type Props = {
  row: RowProps<TableData>
  isSelected: boolean
  bottomElement?: React.MutableRefObject<HTMLDivElement | null>
  onExpandButtonClick: () => void
}

export const Row = ({
  row,
  bottomElement,
  onExpandButtonClick,
  isSelected,
}: Props) => {
  const [isExpandButtonVisible, setIsExpandButtonVisible] = useState(false)
  const hoverBg = useColorModeValue('gray.50', 'gray.800')

  const showExpandButton = () => setIsExpandButtonVisible(true)
  const hideExpandButton = () => setIsExpandButtonVisible(false)
  return (
    <chakra.tr
      key={row.id}
      data-rowid={row.id}
      role="group"
      ref={(ref: HTMLTableRowElement | null) => {
        if (bottomElement && bottomElement.current?.dataset.rowid !== row.id)
          bottomElement.current = ref
      }}
      onMouseEnter={showExpandButton}
      onClick={showExpandButton}
      onMouseLeave={hideExpandButton}
      transition="background 0.1s"
      _hover={{ bg: hoverBg }}
    >
      {row.getVisibleCells().map((cell, cellIndex) => (
        <Cell
          key={cell.id}
          cell={cell}
          size={cell.column.getSize()}
          isExpandButtonVisible={isExpandButtonVisible}
          rowIndex={row.index}
          cellIndex={cellIndex}
          onExpandButtonClick={onExpandButtonClick}
          isSelected={isSelected}
        />
      ))}
    </chakra.tr>
  )
}
