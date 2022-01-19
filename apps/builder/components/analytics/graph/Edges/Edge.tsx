import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import { useGraph } from 'contexts/GraphContext'
import React, { useEffect, useMemo, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
} from 'services/graph'

type Props = { edgeId: string }

export const Edge = ({ edgeId }: Props) => {
  const { typebot } = useAnalyticsGraph()
  const edge = typebot?.edges.byId[edgeId]
  const { sourceEndpoints, targetEndpoints, graphPosition } = useGraph()
  const [sourceTop, setSourceTop] = useState(
    getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      getSourceEndpointId(edge)
    )
  )
  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset(graphPosition, sourceEndpoints, edge?.to.stepId)
  )

  useEffect(() => {
    const newSourceTop = getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      getSourceEndpointId(edge)
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      sourceTop < newSourceTop + sensibilityThreshold &&
      sourceTop > newSourceTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setSourceTop(newSourceTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition])

  useEffect(() => {
    const newTargetTop = getEndpointTopOffset(
      graphPosition,
      targetEndpoints,
      edge?.to.stepId
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      targetTop < newTargetTop + sensibilityThreshold &&
      targetTop > newTargetTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setTargetTop(newTargetTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition])

  const { sourceBlock, targetBlock } = useMemo(() => {
    if (!typebot || !edge) return {}
    const targetBlock = typebot.blocks.byId[edge.to.blockId]
    const sourceBlock = typebot.blocks.byId[edge.from.blockId]
    return {
      sourceBlock,
      targetBlock,
    }
  }, [edge, typebot])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock) return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlock,
      targetBlock,
      sourceTop,
      targetTop,
    })
    return computeEdgePath(anchorsPosition)
  }, [sourceBlock, sourceTop, targetBlock, targetTop])

  return (
    <path
      d={path}
      stroke={'#718096'}
      strokeWidth="2px"
      markerEnd="url(#arrow)"
      fill="none"
    />
  )
}
