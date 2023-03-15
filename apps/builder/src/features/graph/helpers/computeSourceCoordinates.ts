import { blockWidth } from '../constants'
import { Coordinates } from '../types'

export const computeSourceCoordinates = (
  sourcePosition: Coordinates,
  sourceTop: number
) => ({
  x: sourcePosition.x + blockWidth,
  y: sourceTop,
})
