import { roundCorners } from 'svg-round-corners'
import { pathRadius } from '../constants'
import { Coordinates } from '../types'
import { computeThreeSegments } from './segments'

export const computeEdgePathToMouse = ({
  sourceGroupCoordinates,
  mousePosition,
  sourceTop,
  elementWidth,
}: {
  sourceGroupCoordinates: Coordinates
  mousePosition: Coordinates
  sourceTop: number
  elementWidth: number
}): string => {
  const sourcePosition = {
    x:
      mousePosition.x - sourceGroupCoordinates.x > elementWidth / 2
        ? sourceGroupCoordinates.x + elementWidth
        : sourceGroupCoordinates.x,
    y: sourceTop,
  }
  const sourceType =
    mousePosition.x - sourceGroupCoordinates.x > elementWidth / 2
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
