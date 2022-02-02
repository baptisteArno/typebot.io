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
    if (ranOnce || !ref.current) return
    const id = source.buttonId ?? source.stepId + (source.conditionType ?? '')
    addSourceEndpoint({
      id,
      ref,
    })
    setRanOnce(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current])

  if (!blocksCoordinates) return <></>
  return (
    <Flex
      ref={ref}
      boxSize="18px"
      rounded="full"
      onMouseDown={handleMouseDown}
      cursor="copy"
      borderWidth="1px"
      borderColor="gray.400"
      bgColor="white"
      justify="center"
      align="center"
      {...props}
    >
      <Box bgColor="gray.400" rounded="full" boxSize="6px" />
    </Flex>
  )
}
