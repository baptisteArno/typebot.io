import React, { memo, useState } from 'react'
import { Row as RowProps } from '@tanstack/react-table'
import { Button, chakra, Fade } from '@chakra-ui/react'
import { ExpandIcon } from 'assets/icons'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: RowProps<any>
  isSelected: boolean
  bottomElement?: React.MutableRefObject<HTMLDivElement | null>
  onExpandButtonClick: () => void
}

const Row = ({ row, bottomElement, onExpandButtonClick }: Props) => {
  const [isExpandButtonVisible, setIsExpandButtonVisible] = useState(false)

  const showExpandButton = () => setIsExpandButtonVisible(true)
  const hideExpandButton = () => setIsExpandButtonVisible(false)
  return (
    <tr
      key={row.id}
      data-rowid={row.id}
      ref={(ref) => {
        if (bottomElement && bottomElement.current?.dataset.rowid !== row.id)
          bottomElement.current = ref
      }}
      onMouseEnter={showExpandButton}
      onClick={showExpandButton}
      onMouseLeave={hideExpandButton}
    >
      {row.getVisibleCells().map((cell, cellIndex) => (
        <chakra.td
          key={cell.id}
          px="4"
          py="2"
          border="1px"
          borderColor="gray.200"
          whiteSpace="nowrap"
          wordBreak="normal"
          overflow="hidden"
          pos="relative"
        >
          {cell.renderCell()}
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
                shadow="lg"
                size="xs"
                onClick={onExpandButtonClick}
              >
                Open
              </Button>
            </Fade>
          </chakra.span>
        </chakra.td>
      ))}
    </tr>
  )
}

export default memo(
  Row,
  (prev, next) =>
    prev.row.id === next.row.id && prev.isSelected === next.isSelected
)
