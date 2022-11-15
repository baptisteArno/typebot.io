import { Box, BoxProps, chakra } from '@chakra-ui/react'
import { flexRender, HeaderGroup } from '@tanstack/react-table'
import React from 'react'
import { TableData } from '../../types'

type Props = {
  headerGroup: HeaderGroup<TableData>
}

export const HeaderRow = ({ headerGroup }: Props) => {
  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return (
          <chakra.th
            key={header.id}
            px="4"
            py="2"
            pos="relative"
            border="1px"
            borderColor="gray.200"
            fontWeight="normal"
            whiteSpace="nowrap"
            wordBreak="normal"
            colSpan={header.colSpan}
            style={{
              minWidth: header.getSize(),
              maxWidth: header.getSize(),
            }}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
            {header.column.getCanResize() && (
              <ResizeHandle
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
              />
            )}
          </chakra.th>
        )
      })}
    </tr>
  )
}

const ResizeHandle = (props: BoxProps) => {
  return (
    <Box
      pos="absolute"
      right="-5px"
      w="10px"
      h="full"
      top="0"
      cursor="col-resize"
      zIndex={2}
      userSelect="none"
      data-testid="resize-handle"
      {...props}
    />
  )
}
