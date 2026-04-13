import { chakra, Fade, Button, useColorModeValue } from '@chakra-ui/react'
import { Cell as CellProps, flexRender } from '@tanstack/react-table'
import { ExpandIcon } from '@/components/icons'
import { memo } from 'react'
import { TableData } from '@typebot.io/schemas'

type Props = {
  cell: CellProps<TableData, unknown>
  size: number
  isExpandButtonVisible: boolean
  rowIndex: number
  cellIndex: number
  isSelected: boolean
  onExpandButtonClick: () => void
}

const Cell = ({
  cell,
  size,
  isExpandButtonVisible,
  rowIndex,
  cellIndex,
  onExpandButtonClick,
}: Props) => {
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.200')

  return (
    <chakra.td
      key={cell.id}
      px="4"
      py="2.5"
      borderBottom="1px solid"
      borderColor={borderColor}
      whiteSpace="pre-wrap"
      pos="relative"
      fontSize="sm"
      color={textColor}
      style={{
        minWidth: size,
        maxWidth: size,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
      <chakra.span
        pos="absolute"
        top="0"
        right={2}
        h="full"
        display="inline-flex"
        alignItems="center"
      >
        <Fade unmountOnExit in={isExpandButtonVisible && cellIndex === 1}>
          <Button
            leftIcon={<ExpandIcon />}
            shadow="md"
            size="xs"
            rounded="full"
            colorScheme="blue"
            variant="solid"
            onClick={onExpandButtonClick}
          >
            Abrir
          </Button>
        </Fade>
      </chakra.span>
    </chakra.td>
  )
}

export default memo(
  Cell,
  (prev, next) =>
    prev.size === next.size &&
    prev.isExpandButtonVisible === next.isExpandButtonVisible &&
    prev.isSelected === next.isSelected
)
