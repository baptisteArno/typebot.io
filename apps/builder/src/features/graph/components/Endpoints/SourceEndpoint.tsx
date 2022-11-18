import { BoxProps, Flex } from '@chakra-ui/react'
import { useGraph, useGroupsCoordinates } from '../../providers'
import { Source } from 'models'
import React, { MouseEvent, useEffect, useRef, useState } from 'react'

export const SourceEndpoint = ({
  source,
  ...props
}: BoxProps & {
  source: Source
}) => {
  const [ranOnce, setRanOnce] = useState(false)
  const { setConnectingIds, addSourceEndpoint, previewingEdge } = useGraph()

  const { groupsCoordinates } = useGroupsCoordinates()
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setConnectingIds({ source })
  }

  useEffect(() => {
    if (ranOnce || !ref.current || Object.keys(groupsCoordinates).length === 0)
      return
    const id = source.itemId ?? source.blockId
    addSourceEndpoint({
      id,
      ref,
    })
    setRanOnce(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, groupsCoordinates])

  if (!groupsCoordinates) return <></>
  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      rounded="full"
      onPointerDownCapture={handleMouseDown}
      onMouseDownCapture={(e) => e.stopPropagation()}
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      className="prevent-group-drag"
      {...props}
    >
      <Flex
        boxSize="20px"
        justify="center"
        align="center"
        bgColor="gray.100"
        rounded="full"
        pointerEvents="none"
      >
        <Flex
          boxSize="13px"
          rounded="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge?.from.blockId === source.blockId &&
            previewingEdge.from.itemId === source.itemId
              ? 'blue.300'
              : 'blue.200'
          }
        />
      </Flex>
    </Flex>
  )
}
