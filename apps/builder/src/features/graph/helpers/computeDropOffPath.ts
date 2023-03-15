import { roundCorners } from 'svg-round-corners'
import { pathRadius } from '../constants'
import { Coordinates } from '../types'
import { computeSourceCoordinates } from './computeSourceCoordinates'
import { computeTwoSegments } from './segments'

export const computeDropOffPath = (
  sourcePosition: Coordinates,
  sourceTop: number
) => {
  const sourceCoord = computeSourceCoordinates(sourcePosition, sourceTop)
  const segments = computeTwoSegments(sourceCoord, {
    x: sourceCoord.x + 20,
    y: sourceCoord.y + 80,
  })
  return roundCorners(
    `M${sourceCoord.x},${sourceCoord.y} ${segments}`,
    pathRadius
  ).path
}
