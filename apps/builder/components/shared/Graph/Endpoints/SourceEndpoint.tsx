import { Box, BoxProps, Flex } from '@chakra-ui/react'
import { useGraph } from 'contexts/GraphContext'
import { Source } from 'models'
import React, { MouseEvent, useEffect, useRef, useState } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: Source
}) => {
  const [ranOnce, setRanOnce] = useState(false)
  const { setConnectingIds, addSourceEndpoint, blocksCoordinates } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setConnectingIds({ source })
  }

  useEffect(() => {
    if (ranOnce || !ref.current || Object.keys(blocksCoordinates).length === 0)
      return
    const id = source.itemId ?? source.stepId
    addSourceEndpoint({
      id,
      ref,
    })
    setRanOnce(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, blocksCoordinates])

  if (!blocksCoordinates) return <></>
  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="18px"
      rounded="full"
      onMouseDownCapture={handleMouseDown}
      cursor="copy"
      borderWidth="1px"
      borderColor="gray.400"
      bgColor="white"
      justify="center"
      align="center"
      pointerEvents="all"
      {...props}
    >
      <Box bgColor="gray.400" rounded="full" boxSize="6px" />
    </Flex>
  )
}
