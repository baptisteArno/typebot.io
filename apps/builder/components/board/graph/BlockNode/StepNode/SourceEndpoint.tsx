import { Box, BoxProps } from '@chakra-ui/react'
import { ConnectingSourceIds, useGraph } from 'contexts/GraphContext'
import React, { MouseEvent } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: ConnectingSourceIds
}) => {
  const { setConnectingIds } = useGraph()

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setConnectingIds({ source })
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
