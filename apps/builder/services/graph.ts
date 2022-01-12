import { Coordinates } from '@dnd-kit/core/dist/types'
import { Block, ChoiceInputStep, Step, Table, Target, Typebot } from 'models'
import { AnchorsPositionProps } from 'components/board/graph/Edges/Edge'
import {
  stubLength,
  blockWidth,
  blockAnchorsOffset,
  spaceBetweenSteps,
  firstStepOffsetY,
  firstChoiceItemOffsetY,
  ConnectingIds,
} from 'contexts/GraphContext'
import { roundCorners } from 'svg-round-corners'
import { isChoiceInput, isDefined } from 'utils'

export const computeDropOffPath = (
  sourcePosition: Coordinates,
  sourceStepIndex: number
) => {
  const sourceCoord = computeSourceCoordinates(sourcePosition, sourceStepIndex)
  const segments = computeTwoSegments(sourceCoord, {
    x: sourceCoord.x + 20,
    y: sourceCoord.y + 80,
  })
  return roundCorners(`M${sourceCoord.x},${sourceCoord.y} ${segments}`, 10).path
}

export const computeSourceCoordinates = (
  sourcePosition: Coordinates,
  sourceStepIndex: number,
  sourceChoiceItemIndex?: number
) => ({
  x: sourcePosition.x + blockWidth,
  y:
    (sourcePosition.y ?? 0) +
    firstStepOffsetY +
    spaceBetweenSteps * sourceStepIndex +
    (isDefined(sourceChoiceItemIndex)
      ? firstChoiceItemOffsetY +
        (sourceChoiceItemIndex ?? 0) * spaceBetweenSteps
      : 0),
})

export const computeFlowChartConnectorPath = ({
  sourcePosition,
  targetPosition,
  sourceType,
  totalSegments,
}: AnchorsPositionProps) => {
  const segments = getSegments({
    sourcePosition,
    targetPosition,
    sourceType,
    totalSegments,
  })
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    10
  ).path
}

const getSegments = ({
  sourcePosition,
  targetPosition,
  sourceType,
  totalSegments,
}: AnchorsPositionProps) => {
  switch (totalSegments) {
    case 2:
      return computeTwoSegments(sourcePosition, targetPosition)
    case 3:
      return computeThreeSegments(sourcePosition, targetPosition, sourceType)
    case 4:
      return computeFourSegments(sourcePosition, targetPosition, sourceType)
    default:
      return computeFiveSegments(sourcePosition, targetPosition, sourceType)
  }
}

const computeTwoSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates
) => {
  const segments = []
  segments.push(`L${targetPosition.x},${sourcePosition.y}`)
  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeThreeSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourceType === 'right'
      ? sourcePosition.x + (targetPosition.x - sourcePosition.x) / 2
      : sourcePosition.x - (sourcePosition.x - targetPosition.x) / 2
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  segments.push(`L${firstSegmentX},${targetPosition.y}`)
  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeFourSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  const secondSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) / 2
  segments.push(`L${firstSegmentX},${secondSegmentY}`)

  segments.push(`L${targetPosition.x},${secondSegmentY}`)

  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeFiveSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  const firstSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) / 2
  segments.push(
    `L${
      sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
    },${firstSegmentY}`
  )

  const secondSegmentX =
    targetPosition.x - (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${secondSegmentX},${firstSegmentY}`)

  segments.push(`L${secondSegmentX},${targetPosition.y}`)

  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

type GetAnchorsPositionParams = {
  sourceBlock: Block
  targetBlock: Block
  sourceStepIndex: number
  sourceChoiceItemIndex?: number
  targetStepIndex?: number
}
export const getAnchorsPosition = ({
  sourceBlock,
  targetBlock,
  sourceStepIndex,
  sourceChoiceItemIndex,
  targetStepIndex,
}: GetAnchorsPositionParams): AnchorsPositionProps => {
  const targetOffsetY = isDefined(targetStepIndex)
    ? (targetBlock.graphCoordinates.y ?? 0) +
      firstStepOffsetY +
      spaceBetweenSteps * targetStepIndex
    : undefined

  const sourcePosition = computeSourceCoordinates(
    sourceBlock.graphCoordinates,
    sourceStepIndex,
    sourceChoiceItemIndex
  )
  let sourceType: 'right' | 'left' = 'right'
  if (sourceBlock.graphCoordinates.x > targetBlock.graphCoordinates.x) {
    sourcePosition.x = sourceBlock.graphCoordinates.x
    sourceType = 'left'
  }

  const { targetPosition, totalSegments } = computeBlockTargetPosition(
    sourceBlock.graphCoordinates,
    targetBlock.graphCoordinates,
    sourcePosition.y,
    targetOffsetY
  )
  return { sourcePosition, targetPosition, sourceType, totalSegments }
}

const computeBlockTargetPosition = (
  sourceBlockPosition: Coordinates,
  targetBlockPosition: Coordinates,
  offsetY: number,
  targetOffsetY?: number
): { targetPosition: Coordinates; totalSegments: number } => {
  const isTargetBlockBelow =
    targetBlockPosition.y > offsetY &&
    targetBlockPosition.x < sourceBlockPosition.x + blockWidth + stubLength &&
    targetBlockPosition.x > sourceBlockPosition.x - blockWidth - stubLength
  const isTargetBlockToTheRight = targetBlockPosition.x < sourceBlockPosition.x
  const isTargettingBlock = !targetOffsetY

  if (isTargetBlockBelow && isTargettingBlock) {
    const isExterior =
      targetBlockPosition.x <
        sourceBlockPosition.x - blockWidth / 2 - stubLength ||
      targetBlockPosition.x >
        sourceBlockPosition.x + blockWidth / 2 + stubLength
    const targetPosition = parseBlockAnchorPosition(targetBlockPosition, 'top')
    return { totalSegments: isExterior ? 2 : 4, targetPosition }
  } else {
    const isExterior =
      targetBlockPosition.x < sourceBlockPosition.x - blockWidth ||
      targetBlockPosition.x > sourceBlockPosition.x + blockWidth
    const targetPosition = parseBlockAnchorPosition(
      targetBlockPosition,
      isTargetBlockToTheRight ? 'right' : 'left',
      targetOffsetY
    )
    return { totalSegments: isExterior ? 3 : 5, targetPosition }
  }
}

const parseBlockAnchorPosition = (
  blockPosition: Coordinates,
  anchor: 'left' | 'top' | 'right',
  targetOffsetY?: number
): Coordinates => {
  switch (anchor) {
    case 'left':
      return {
        x: blockPosition.x + blockAnchorsOffset.left.x,
        y: targetOffsetY ?? blockPosition.y + blockAnchorsOffset.left.y,
      }
    case 'top':
      return {
        x: blockPosition.x + blockAnchorsOffset.top.x,
        y: blockPosition.y + blockAnchorsOffset.top.y,
      }
    case 'right':
      return {
        x: blockPosition.x + blockAnchorsOffset.right.x,
        y: targetOffsetY ?? blockPosition.y + blockAnchorsOffset.right.y,
      }
  }
}

export const computeDrawingConnectedPath = (
  connectingIds: Omit<ConnectingIds, 'target'> & { target: Target },
  sourceBlock: Block,
  typebot: Typebot
) => {
  if (!sourceBlock) return ``
  const targetBlock = typebot.blocks.byId[connectingIds.target.blockId]
  const targetStepIndex = connectingIds.target.stepId
    ? targetBlock.stepIds.findIndex(
        (stepId) => stepId === connectingIds.target?.stepId
      )
    : undefined

  const sourceStepIndex = sourceBlock?.stepIds.indexOf(
    connectingIds?.source.stepId
  )
  const sourceStep = typebot.steps.byId[connectingIds?.source.stepId]
  const sourceChoiceItemIndex = isChoiceInput(sourceStep)
    ? getSourceChoiceItemIndex(sourceStep, connectingIds.source.choiceItemId)
    : undefined
  const anchorsPosition = getAnchorsPosition({
    sourceBlock,
    targetBlock,
    sourceStepIndex,
    sourceChoiceItemIndex,
    targetStepIndex,
  })
  return computeFlowChartConnectorPath(anchorsPosition)
}

export const computeDrawingPathToMouse = (
  sourceBlock: Block,
  connectingIds: ConnectingIds,
  mousePosition: Coordinates,
  steps: Table<Step>
) => {
  const sourceStep = steps.byId[connectingIds?.source.stepId ?? '']
  return computeConnectingEdgePath({
    blockPosition: sourceBlock?.graphCoordinates,
    mousePosition,
    stepIndex: sourceBlock.stepIds.findIndex(
      (stepId) => stepId === connectingIds?.source.stepId
    ),
    choiceItemIndex: isChoiceInput(sourceStep)
      ? getSourceChoiceItemIndex(sourceStep, connectingIds?.source.choiceItemId)
      : undefined,
  })
}

const computeConnectingEdgePath = ({
  blockPosition,
  mousePosition,
  stepIndex,
  choiceItemIndex,
}: {
  blockPosition: Coordinates
  mousePosition: Coordinates
  stepIndex: number
  choiceItemIndex?: number
}): string => {
  const sourcePosition = {
    x:
      mousePosition.x - blockPosition.x > blockWidth / 2
        ? blockPosition.x + blockWidth - 40
        : blockPosition.x + 40,
    y:
      blockPosition.y +
      firstStepOffsetY +
      stepIndex * spaceBetweenSteps +
      (isDefined(choiceItemIndex)
        ? firstChoiceItemOffsetY + (choiceItemIndex ?? 0) * spaceBetweenSteps
        : 0),
  }
  const sourceType =
    mousePosition.x - blockPosition.x > blockWidth / 2 ? 'right' : 'left'
  const segments = computeThreeSegments(
    sourcePosition,
    mousePosition,
    sourceType
  )
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    10
  ).path
}

export const getSourceChoiceItemIndex = (
  step: ChoiceInputStep,
  itemId?: string
) =>
  itemId ? step.options.itemIds.indexOf(itemId) : step.options.itemIds.length
