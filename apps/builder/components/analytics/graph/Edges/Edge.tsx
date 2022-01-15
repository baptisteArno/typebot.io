import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import { useGraph } from 'contexts/GraphContext'
import React, { useEffect, useMemo, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
} from 'services/graph'

type Props = { stepId: string }

export const Edge = ({ stepId }: Props) => {
  const { typebot } = useAnalyticsGraph()
  const step = typebot?.steps.byId[stepId]
  const { sourceEndpoints, targetEndpoints, graphPosition } = useGraph()
  const [sourceTop, setSourceTop] = useState(
    getEndpointTopOffset(graphPosition, sourceEndpoints, stepId)
  )
  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset(graphPosition, sourceEndpoints, step?.target?.stepId)
  )

  useEffect(() => {
    const newSourceTop = getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      stepId
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
      step?.target?.stepId
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
    if (!typebot) return {}
    if (!step?.target) return {}
    const targetBlock = typebot.blocks.byId[step.target.blockId]
    const sourceBlock = typebot.blocks.byId[step.blockId]
    return {
      sourceBlock,
      targetBlock,
    }
  }, [step?.blockId, step?.target, typebot])

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
