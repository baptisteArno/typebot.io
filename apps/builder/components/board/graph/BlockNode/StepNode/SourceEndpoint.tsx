import { Box, BoxProps } from '@chakra-ui/react'
import { ConnectingSourceIds, useGraph } from 'contexts/GraphContext'
import React, { MouseEvent, useEffect, useRef } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: ConnectingSourceIds
}) => {
  const { setConnectingIds, addSourceEndpoint: addEndpoint } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setConnectingIds({ source })
  }

  useEffect(() => {
    if (!ref.current) return
    const id =
      source.choiceItemId ?? source.stepId + (source.conditionType ?? '')
    addEndpoint({
      id,
      ref,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  return (
    <Box
      ref={ref}
      boxSize="15px"
      rounded="full"
      bgColor="gray.500"
      onMouseDown={handleMouseDown}
      cursor="pointer"
      {...props}
    />
  )
}
