import { computeEdgePath } from './computeEdgePath'
import {
  getAnchorsPosition,
  GetAnchorsPositionProps,
} from './getAnchorsPosition'

export const computeConnectingEdgePath = ({
  sourceGroupCoordinates,
  targetGroupCoordinates,
  sourceTop,
  targetTop,
  graphScale,
}: GetAnchorsPositionProps) => {
  const anchorsPosition = getAnchorsPosition({
    sourceGroupCoordinates,
    targetGroupCoordinates,
    sourceTop,
    targetTop,
    graphScale,
  })
  return computeEdgePath(anchorsPosition)
}
