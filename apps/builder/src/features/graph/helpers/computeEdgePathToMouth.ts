import { roundCorners } from 'svg-round-corners'
import { blockWidth, pathRadius } from '../constants'
import { Coordinates } from '../types'
import { computeThreeSegments } from './segments'

export const computeEdgePathToMouse = ({
  sourceGroupCoordinates,
  mousePosition,
  sourceTop,
}: {
  sourceGroupCoordinates: Coordinates
  mousePosition: Coordinates
  sourceTop: number
}): string => {
  const sourcePosition = {
    x:
      mousePosition.x - sourceGroupCoordinates.x > blockWidth / 2
        ? sourceGroupCoordinates.x + blockWidth
        : sourceGroupCoordinates.x,
    y: sourceTop,
  }
  const sourceType =
    mousePosition.x - sourceGroupCoordinates.x > blockWidth / 2
      ? 'right'
      : 'left'
  const segments = computeThreeSegments(
    sourcePosition,
    mousePosition,
    sourceType
  )
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    pathRadius
  ).path
}
