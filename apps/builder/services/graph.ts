import { Coordinates } from '@dnd-kit/core/dist/types'
import {
  StepType,
  Block,
  Step,
  TextStep,
  ImageStep,
  DatePickerStep,
  StartBlock,
} from 'bot-engine'
import { AnchorsPositionProps } from 'components/board/graph/Edges/Edge'
import {
  stubLength,
  blockWidth,
  blockAnchorsOffset,
  spaceBetweenSteps,
  firstStepOffsetY,
} from 'contexts/GraphContext'
import shortId from 'short-uuid'
import { roundCorners } from 'svg-round-corners'
import { isDefined } from './utils'

export const parseNewBlock = ({
  type,
  totalBlocks,
  initialCoordinates,
  step,
}: {
  step?: Step
  type?: StepType
  totalBlocks: number
  initialCoordinates: { x: number; y: number }
}): Block => {
  const id = `b${shortId.generate()}`
  return {
    id,
    title: `Block #${totalBlocks + 1}`,
    graphCoordinates: initialCoordinates,
    steps: [
      step ? { ...step, blockId: id } : parseNewStep(type as StepType, id),
    ],
  }
}

export const parseNewStep = (type: StepType, blockId: string): Step => {
  const id = `s${shortId.generate()}`
  switch (type) {
    case StepType.TEXT: {
      const textStep: TextStep = { type, content: '' }
      return { blockId, id, ...textStep }
    }
    case StepType.IMAGE: {
      const imageStep: ImageStep = { type, content: { url: '' } }
      return { blockId, id, ...imageStep }
    }
    case StepType.DATE_PICKER: {
      const imageStep: DatePickerStep = { type, content: '' }
      return { blockId, id, ...imageStep }
    }
    default: {
      const textStep: TextStep = { type: StepType.TEXT, content: '' }
      return { blockId, id, ...textStep }
    }
  }
}

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

export const getAnchorsPosition = (
  sourceBlock: Block | StartBlock,
  targetBlock: Block,
  sourceStepIndex: number,
  targetStepIndex?: number
): AnchorsPositionProps => {
  const sourceOffsetY =
    (sourceBlock.graphCoordinates.y ?? 0) +
    firstStepOffsetY +
    spaceBetweenSteps * sourceStepIndex
  const targetOffsetY = isDefined(targetStepIndex)
    ? (targetBlock.graphCoordinates.y ?? 0) +
      firstStepOffsetY +
      spaceBetweenSteps * targetStepIndex
    : undefined

  const sourcePosition = {
    x: (sourceBlock.graphCoordinates.x ?? 0) + blockWidth,
    y: sourceOffsetY,
  }
  let sourceType: 'right' | 'left' = 'right'
  if (sourceBlock.graphCoordinates.x > targetBlock.graphCoordinates.x) {
    sourcePosition.x = sourceBlock.graphCoordinates.x
    sourceType = 'left'
  }

  const { targetPosition, totalSegments } = computeBlockTargetPosition(
    sourceBlock.graphCoordinates,
    targetBlock.graphCoordinates,
    sourceOffsetY,
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
