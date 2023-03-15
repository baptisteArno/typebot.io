import { Box, BoxProps } from '@chakra-ui/react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { useGraph } from '../../providers/GraphProvider'

const endpointHeight = 20

export const TargetEndpoint = ({
  groupId,
  blockId,
  ...props
}: BoxProps & {
  groupId: string
  blockId: string
}) => {
  const { setTargetEnpointYOffset: addTargetEndpoint } = useEndpoints()
  const { graphPosition } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)
  const [groupHeight, setGroupHeight] = useState<number>()
  const [groupTransformProp, setGroupTransformProp] = useState<string>()

  const endpointY = useMemo(
    () =>
      ref.current
        ? (ref.current?.getBoundingClientRect().y +
            (endpointHeight * graphPosition.scale) / 2 -
            graphPosition.y) /
          graphPosition.scale
        : undefined,
    // We need to force recompute whenever the group height and position changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphPosition.scale, graphPosition.y, groupHeight, groupTransformProp]
  )

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setGroupHeight(entries[0].contentRect.height)
    })
    const groupElement = document.getElementById(`group-${groupId}`)
    if (!groupElement) return
    resizeObserver.observe(groupElement)
    return () => {
      resizeObserver.disconnect()
    }
  }, [groupId])

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setGroupTransformProp((entries[0].target as HTMLElement).style.transform)
    })
    const groupElement = document.getElementById(`group-${groupId}`)
    if (!groupElement) return
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => {
      mutationObserver.disconnect()
    }
  }, [groupId])

  useEffect(() => {
    if (!endpointY) return
    const id = blockId
    addTargetEndpoint?.({
      id,
      y: endpointY,
    })
  }, [addTargetEndpoint, blockId, endpointY])

  return (
    <Box
      ref={ref}
      boxSize="20px"
      rounded="full"
      bgColor="blue.500"
      cursor="pointer"
      visibility="hidden"
      {...props}
    />
  )
}
