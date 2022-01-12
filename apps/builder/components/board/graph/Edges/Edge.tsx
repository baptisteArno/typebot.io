import { isDefined } from '@udecode/plate-core'
import assert from 'assert'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ChoiceItem } from 'models'
import React, { useMemo } from 'react'
import {
  getAnchorsPosition,
  computeFlowChartConnectorPath,
  getSourceChoiceItemIndex,
} from 'services/graph'
import { isChoiceInput } from 'utils'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = ({
  stepId,
  item,
}: {
  stepId: string
  item?: ChoiceItem
}) => {
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
    const sourceBlock = typebot.blocks.byId[step.blockId]
    const targetBlockId = item?.target?.blockId ?? step.target?.blockId
    assert(isDefined(targetBlockId))
    const targetBlock = typebot.blocks.byId[targetBlockId]
    const targetStepId = item?.target?.stepId ?? step.target?.stepId
    const targetStepIndex = targetStepId
      ? targetBlock.stepIds.indexOf(targetStepId)
      : undefined
    return {
      sourceBlock,
      targetBlock,
      targetStepIndex,
    }
  }, [item?.target?.blockId, item?.target?.stepId, stepId, typebot])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock || !step) return ``
    const sourceChoiceItemIndex = isChoiceInput(step)
      ? getSourceChoiceItemIndex(step, item?.id)
      : undefined
    const anchorsPosition = getAnchorsPosition({
      sourceBlock,
      targetBlock,
      sourceStepIndex: sourceBlock.stepIds.indexOf(stepId),
      targetStepIndex,
      sourceChoiceItemIndex,
    })
    return computeFlowChartConnectorPath(anchorsPosition)
  }, [item, sourceBlock, step, stepId, targetBlock, targetStepIndex])

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
