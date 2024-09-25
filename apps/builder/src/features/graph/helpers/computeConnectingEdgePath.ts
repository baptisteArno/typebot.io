import { computeEdgePath } from "./computeEdgePath";
import {
  type GetAnchorsPositionProps,
  getAnchorsPosition,
} from "./getAnchorsPosition";

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
  });
  return computeEdgePath(anchorsPosition);
};
