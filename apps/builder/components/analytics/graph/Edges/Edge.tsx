import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import React, { useMemo } from 'react'
import {
  getAnchorsPosition,
  computeFlowChartConnectorPath,
} from 'services/graph'

type Props = { stepId: string }

export const Edge = ({ stepId }: Props) => {
  const { typebot } = useAnalyticsGraph()

  const { sourceBlock, targetBlock, targetStepIndex } = useMemo(() => {
    if (!typebot) return {}
    const step = typebot.steps.byId[stepId]
    if (!step.target) return {}
    const targetBlock = typebot.blocks.byId[step.target.blockId]
    const targetStepIndex = step.target.stepId
      ? targetBlock.stepIds.indexOf(step.target.stepId)
      : undefined
    const sourceBlock = typebot.blocks.byId[step.blockId]
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
      stroke={'#718096'}
      strokeWidth="2px"
      markerEnd="url(#arrow)"
      fill="none"
    />
  )
}
