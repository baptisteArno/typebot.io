import { Block, StartStep, Step, Target } from 'bot-engine'
import { Coordinates, useGraph } from 'contexts/GraphContext'
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

export type StepWithTarget = Omit<Step | StartStep, 'target'> & {
  target: Target
}

export const Edge = ({ step }: { step: StepWithTarget }) => {
  const { blocks, startBlock } = useGraph()

  const { sourceBlock, targetBlock, targetStepIndex } = useMemo(() => {
    const targetBlock = blocks.find(
      (b) => b?.id === step.target.blockId
    ) as Block
    const targetStepIndex = step.target.stepId
      ? targetBlock.steps.findIndex((s) => s.id === step.target.stepId)
      : undefined
    return {
      sourceBlock: [startBlock, ...blocks].find((b) => b?.id === step.blockId),
      targetBlock,
      targetStepIndex,
    }
  }, [
    blocks,
    startBlock,
    step.blockId,
    step.target.blockId,
    step.target.stepId,
  ])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock) return ``
    const anchorsPosition = getAnchorsPosition(
      sourceBlock,
      targetBlock,
      sourceBlock.steps.findIndex((s) => s.id === step.id),
      targetStepIndex
    )
    return computeFlowChartConnectorPath(anchorsPosition)
  }, [sourceBlock, step.id, targetBlock, targetStepIndex])

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
