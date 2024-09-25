import { groupAnchorsOffset, stubLength } from "../constants";
import type { AnchorsPositionProps, Coordinates } from "../types";
import { computeSourceCoordinates } from "./computeSourceCoordinates";

export type GetAnchorsPositionProps = {
  sourceGroupCoordinates: Coordinates;
  targetGroupCoordinates: Coordinates;
  elementWidth: number;
  sourceTop: number;
  targetTop?: number;
  graphScale: number;
};

export const getAnchorsPosition = ({
  sourceGroupCoordinates,
  targetGroupCoordinates,
  elementWidth,
  sourceTop,
  targetTop,
}: GetAnchorsPositionProps): AnchorsPositionProps => {
  const sourcePosition = computeSourceCoordinates({
    sourcePosition: sourceGroupCoordinates,
    elementWidth,
    sourceTop,
  });
  let sourceType: "right" | "left" = "right";
  if (sourceGroupCoordinates.x > targetGroupCoordinates.x) {
    sourcePosition.x = sourceGroupCoordinates.x;
    sourceType = "left";
  }

  const { targetPosition, totalSegments } = computeGroupTargetPosition({
    sourceGroupPosition: sourceGroupCoordinates,
    targetGroupPosition: targetGroupCoordinates,
    elementWidth,
    sourceOffsetY: sourceTop,
    targetOffsetY: targetTop,
  });
  return { sourcePosition, targetPosition, sourceType, totalSegments };
};

const computeGroupTargetPosition = ({
  sourceGroupPosition,
  targetGroupPosition,
  elementWidth,
  sourceOffsetY,
  targetOffsetY,
}: {
  sourceGroupPosition: Coordinates;
  targetGroupPosition: Coordinates;
  elementWidth: number;
  sourceOffsetY: number;
  targetOffsetY?: number;
}): { targetPosition: Coordinates; totalSegments: number } => {
  const isTargetGroupBelow =
    targetGroupPosition.y > sourceOffsetY &&
    targetGroupPosition.x < sourceGroupPosition.x + elementWidth + stubLength &&
    targetGroupPosition.x > sourceGroupPosition.x - elementWidth - stubLength;
  const isTargetGroupToTheRight = targetGroupPosition.x < sourceGroupPosition.x;
  const isTargettingGroup = !targetOffsetY;

  if (isTargetGroupBelow && isTargettingGroup) {
    const isExterior =
      targetGroupPosition.x <
        sourceGroupPosition.x - elementWidth / 2 - stubLength ||
      targetGroupPosition.x >
        sourceGroupPosition.x + elementWidth / 2 + stubLength;
    const targetPosition = parseGroupAnchorPosition(targetGroupPosition, "top");
    return { totalSegments: isExterior ? 2 : 4, targetPosition };
  } else {
    const isExterior =
      targetGroupPosition.x < sourceGroupPosition.x - elementWidth ||
      targetGroupPosition.x > sourceGroupPosition.x + elementWidth;
    const targetPosition = parseGroupAnchorPosition(
      targetGroupPosition,
      isTargetGroupToTheRight ? "right" : "left",
      targetOffsetY,
    );
    return { totalSegments: isExterior ? 3 : 5, targetPosition };
  }
};

const parseGroupAnchorPosition = (
  blockPosition: Coordinates,
  anchor: "left" | "top" | "right",
  targetOffsetY?: number,
): Coordinates => {
  switch (anchor) {
    case "left":
      return {
        x: blockPosition.x + groupAnchorsOffset.left.x,
        y: targetOffsetY ?? blockPosition.y + groupAnchorsOffset.left.y,
      };
    case "top":
      return {
        x: blockPosition.x + groupAnchorsOffset.top.x,
        y: blockPosition.y + groupAnchorsOffset.top.y,
      };
    case "right":
      return {
        x: blockPosition.x + groupAnchorsOffset.right.x,
        y: targetOffsetY ?? blockPosition.y + groupAnchorsOffset.right.y,
      };
  }
};
