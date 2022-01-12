import { useEventListener } from '@chakra-ui/hooks'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { useGraph, ConnectingIds } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { Target } from 'models'
import React, { useMemo, useState } from 'react'
import {
  computeDrawingConnectedPath,
  computeDrawingPathToMouse,
} from 'services/graph'

export const DrawingEdge = () => {
  const { graphPosition, setConnectingIds, connectingIds } = useGraph()
  const { typebot, updateStep, updateChoiceItem } = useTypebot()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sourceBlock = useMemo(
    () => connectingIds && typebot?.blocks.byId[connectingIds.source.blockId],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectingIds]
  )

  const path = useMemo(() => {
    if (!sourceBlock || !typebot || !connectingIds) return ``

    return connectingIds?.target
      ? computeDrawingConnectedPath(
          connectingIds as Omit<ConnectingIds, 'target'> & { target: Target },
          sourceBlock,
          typebot
        )
      : computeDrawingPathToMouse(
          sourceBlock,
          connectingIds,
          mousePosition,
          typebot.steps
        )
  }, [sourceBlock, typebot, connectingIds, mousePosition])

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({
      x: e.clientX - graphPosition.x,
      y: e.clientY - graphPosition.y - headerHeight,
    })
  }
  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', () => {
    if (connectingIds?.target) createNewEdge(connectingIds)
    setConnectingIds(null)
  })

  const createNewEdge = (connectingIds: ConnectingIds) =>
    connectingIds.source.choiceItemId
      ? updateChoiceItem(connectingIds.source.choiceItemId, {
          target: connectingIds.target,
        })
      : updateStep(connectingIds.source.stepId, {
          target: connectingIds.target,
        })

  if ((mousePosition.x === 0 && mousePosition.y === 0) || !connectingIds)
    return <></>
  return (
    <path
      d={path}
      stroke="#718096"
      strokeWidth="2px"
      markerEnd="url(#arrow)"
      fill="none"
    />
  )
}
