import { headerHeight } from '@/features/editor/constants'
import { groupWidth } from '../constants'
import { Coordinates } from '../types'

export const projectMouse = (
  mouseCoordinates: Coordinates,
  graphPosition: Coordinates & { scale: number }
) => {
  return {
    x:
      (mouseCoordinates.x -
        graphPosition.x -
        groupWidth / (3 / graphPosition.scale)) /
      graphPosition.scale,
    y:
      (mouseCoordinates.y -
        graphPosition.y -
        (headerHeight + 20 * graphPosition.scale)) /
      graphPosition.scale,
  }
}
