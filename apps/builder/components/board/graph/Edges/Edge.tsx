import { isDefined } from '@udecode/plate-core'
import assert from 'assert'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ChoiceItem } from 'models'
import React, { useEffect, useMemo, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getTarget,
} from 'services/graph'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export enum EdgeType {
  STEP,
  CHOICE_ITEM,
  CONDITION_TRUE,
  CONDITION_FALSE,
}

export const Edge = ({
  type,
  stepId,
  item,
}: {
  type: EdgeType
  stepId: string
  item?: ChoiceItem
}) => {
  const { typebot } = useTypebot()
  const { previewingIds, sourceEndpoints, targetEndpoints, graphPosition } =
    useGraph()
  const step = typebot?.steps.byId[stepId]
  const isPreviewing = useMemo(
    () =>
      previewingIds.sourceId === step?.blockId &&
      previewingIds.targetId === step?.target?.blockId,
    [previewingIds.sourceId, previewingIds.targetId, step]
  )
  const [sourceTop, setSourceTop] = useState(
    getEndpointTopOffset(graphPosition, sourceEndpoints, item?.id ?? step?.id)
  )
  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset(graphPosition, targetEndpoints, step?.id)
  )

  useEffect(() => {
    const newSourceTop = getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      getSourceEndpointId()
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      sourceTop < newSourceTop + sensibilityThreshold &&
      sourceTop > newSourceTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setSourceTop(newSourceTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks, typebot?.steps, graphPosition, sourceEndpoints])

  const getSourceEndpointId = () => {
    switch (type) {
      case EdgeType.STEP:
        return step?.id
      case EdgeType.CHOICE_ITEM:
        return item?.id
      case EdgeType.CONDITION_TRUE:
        return step?.id + 'true'
      case EdgeType.CONDITION_FALSE:
        return step?.id + 'false'
    }
  }

  useEffect(() => {
    if (!step) return
    const target = getTarget(step, type)
    const newTargetTop = getEndpointTopOffset(
      graphPosition,
      targetEndpoints,
      target?.blockId ?? target?.stepId
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      targetTop < newTargetTop + sensibilityThreshold &&
      targetTop > newTargetTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setTargetTop(newTargetTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks, typebot?.steps, graphPosition, targetEndpoints])

  const { sourceBlock, targetBlock } = useMemo(() => {
    if (!typebot) return {}
    const step = typebot.steps.byId[stepId]
    const sourceBlock = typebot.blocks.byId[step.blockId]
    const targetBlockId = getTarget(step, type)?.blockId
    assert(isDefined(targetBlockId))
    const targetBlock = typebot.blocks.byId[targetBlockId]
    return {
      sourceBlock,
      targetBlock,
    }
  }, [stepId, type, typebot])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock || !step) return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlock,
      targetBlock,
      sourceTop,
      targetTop,
    })
    return computeEdgePath(anchorsPosition)
  }, [sourceBlock, sourceTop, step, targetBlock, targetTop])

  if (sourceTop === 0) return <></>
  return (
    <path
      d={path}
      stroke={isPreviewing ? '#1a5fff' : '#718096'}
      strokeWidth="2px"
      markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
      fill="none"
    />
  )
}
