import { Box, BoxProps } from '@chakra-ui/react'
import React, { MouseEvent } from 'react'

export const SourceEndpoint = ({
  onConnectionDragStart,
  ...props
}: BoxProps & {
  onConnectionDragStart?: () => void
}) => {
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!onConnectionDragStart) return
    e.stopPropagation()
    onConnectionDragStart()
  }

  return (
    <Box
      boxSize="15px"
      rounded="full"
      bgColor="gray.500"
      onMouseDown={handleMouseDown}
      cursor="pointer"
      {...props}
    />
  )
}
