import { blockAnchorsOffset, blockWidth, stubLength } from '../constants'
import { AnchorsPositionProps, Coordinates } from '../types'
import { computeSourceCoordinates } from './computeSourceCoordinates'

export type GetAnchorsPositionProps = {
  sourceGroupCoordinates: Coordinates
  targetGroupCoordinates: Coordinates
  sourceTop: number
  targetTop?: number
  graphScale: number
}

export const getAnchorsPosition = ({
  sourceGroupCoordinates,
  targetGroupCoordinates,
  sourceTop,
  targetTop,
}: GetAnchorsPositionProps): AnchorsPositionProps => {
  const sourcePosition = computeSourceCoordinates(
    sourceGroupCoordinates,
    sourceTop
  )
  let sourceType: 'right' | 'left' = 'right'
  if (sourceGroupCoordinates.x > targetGroupCoordinates.x) {
    sourcePosition.x = sourceGroupCoordinates.x
    sourceType = 'left'
  }

  const { targetPosition, totalSegments } = computeGroupTargetPosition(
    sourceGroupCoordinates,
    targetGroupCoordinates,
    sourcePosition.y,
    targetTop
  )
  return { sourcePosition, targetPosition, sourceType, totalSegments }
}

const computeGroupTargetPosition = (
  sourceGroupPosition: Coordinates,
  targetGroupPosition: Coordinates,
  sourceOffsetY: number,
  targetOffsetY?: number
): { targetPosition: Coordinates; totalSegments: number } => {
  const isTargetGroupBelow =
    targetGroupPosition.y > sourceOffsetY &&
    targetGroupPosition.x < sourceGroupPosition.x + blockWidth + stubLength &&
    targetGroupPosition.x > sourceGroupPosition.x - blockWidth - stubLength
  const isTargetGroupToTheRight = targetGroupPosition.x < sourceGroupPosition.x
  const isTargettingGroup = !targetOffsetY

  if (isTargetGroupBelow && isTargettingGroup) {
    const isExterior =
      targetGroupPosition.x <
        sourceGroupPosition.x - blockWidth / 2 - stubLength ||
      targetGroupPosition.x >
        sourceGroupPosition.x + blockWidth / 2 + stubLength
    const targetPosition = parseGroupAnchorPosition(targetGroupPosition, 'top')
    return { totalSegments: isExterior ? 2 : 4, targetPosition }
  } else {
    const isExterior =
      targetGroupPosition.x < sourceGroupPosition.x - blockWidth ||
      targetGroupPosition.x > sourceGroupPosition.x + blockWidth
    const targetPosition = parseGroupAnchorPosition(
      targetGroupPosition,
      isTargetGroupToTheRight ? 'right' : 'left',
      targetOffsetY
    )
    return { totalSegments: isExterior ? 3 : 5, targetPosition }
  }
}

const parseGroupAnchorPosition = (
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
