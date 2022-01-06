import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useMemo } from 'react'
import {
  getAnchorsPosition,
  computeFlowChartConnectorPath,
} from 'services/graph'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = ({ stepId }: { stepId: string }) => {
  const { typebot } = useTypebot()
  const { previewingIds } = useGraph()
  const step = typebot?.steps.byId[stepId]
  const isPreviewing = useMemo(
    () =>
      previewingIds.sourceId === step?.blockId &&
      previewingIds.targetId === step?.target?.blockId,
    [previewingIds.sourceId, previewingIds.targetId, step]
  )

  const { sourceBlock, targetBlock, targetStepIndex } = useMemo(() => {
    if (!typebot) return {}
    const step = typebot.steps.byId[stepId]
    if (!step.target) return {}
    const sourceBlock = typebot.blocks.byId[step.blockId]
    const targetBlock = typebot.blocks.byId[step.target.blockId]
    const targetStepIndex = step.target.stepId
      ? targetBlock.stepIds.indexOf(step.target.stepId)
      : undefined
    return {
      sourceBlock,
      targetBlock,
      targetStepIndex,
    }
  }, [stepId, typebot])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock) return ``
    const anchorsPosition = getAnchorsPosition(
      sourceBlock,
      targetBlock,
      sourceBlock.stepIds.indexOf(stepId),
      targetStepIndex
    )
    return computeFlowChartConnectorPath(anchorsPosition)
  }, [sourceBlock, stepId, targetBlock, targetStepIndex])

  return (
    <path
      d={path}
      stroke={isPreviewing ? '#1a5fff' : '#718096'}
      strokeWidth="2px"
      markerEnd="url(#arrow)"
      fill="none"
    />
  )
}
