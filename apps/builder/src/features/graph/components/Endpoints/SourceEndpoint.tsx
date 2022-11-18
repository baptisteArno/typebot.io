import { BoxProps, Flex, useEventListener } from '@chakra-ui/react'
import { useGraph, useGroupsCoordinates } from '../../providers'
import { Source } from 'models'
import React, { useEffect, useRef, useState } from 'react'

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

  useEventListener(
    'pointerdown',
    (e) => {
      e.stopPropagation()
      setConnectingIds({ source })
    },
    ref.current
  )

  useEventListener(
    'mousedown',
    (e) => {
      e.stopPropagation()
    },
    ref.current
  )

  if (!groupsCoordinates) return <></>
  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      rounded="full"
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
