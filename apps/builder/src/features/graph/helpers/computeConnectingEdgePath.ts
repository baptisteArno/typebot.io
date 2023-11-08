import { computeEdgePath } from './computeEdgePath'
import {
  getAnchorsPosition,
  GetAnchorsPositionProps,
} from './getAnchorsPosition'

export const computeConnectingEdgePath = ({
  sourceGroupCoordinates,
  targetGroupCoordinates,
  elementWidth,
  sourceTop,
  targetTop,
  graphScale,
}: GetAnchorsPositionProps) => {
  const anchorsPosition = getAnchorsPosition({
    sourceGroupCoordinates,
    targetGroupCoordinates,
    elementWidth,
    sourceTop,
    targetTop,
    graphScale,
  })
  return computeEdgePath(anchorsPosition)
}
