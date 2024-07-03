import { BoxProps, Flex } from '@chakra-ui/react'
import { useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { Source } from 'models'
import React, { MouseEvent, useEffect, useRef, useState } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: Source
}) => {
  const [ranOnce, setRanOnce] = useState(false)
  const { setHideEdges } = useTypebot()
  const {
    setConnectingIds,
    addSourceEndpoint,
    blocksCoordinates,
    previewingEdge,
  } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setConnectingIds({ source })
    setHideEdges(false)
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
      boxSize="32px"
      rounded="full"
      onMouseDownCapture={handleMouseDown}
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      {...props}
    >
      <Flex
        boxSize="20px"
        justify="center"
        align="center"
        bgColor="gray.100"
        rounded="full"
      >
        <Flex
          boxSize="13px"
          rounded="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge?.from.stepId === source.stepId &&
            previewingEdge.from.itemId === source.itemId
              ? 'blue.300'
              : 'blue.200'
          }
        />
      </Flex>
    </Flex>
  )
}
