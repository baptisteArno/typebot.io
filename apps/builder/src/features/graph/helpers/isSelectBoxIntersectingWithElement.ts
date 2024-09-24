import type { Coordinates } from "../types";

export const isSelectBoxIntersectingWithElement = (
  selectBoxCoordinates: {
    origin: Coordinates;
    dimension: {
      width: number;
      height: number;
    };
  },
  elementRect: DOMRect,
) =>
  selectBoxCoordinates.origin.x < elementRect.right &&
  selectBoxCoordinates.origin.x + selectBoxCoordinates.dimension.width >
    elementRect.left &&
  selectBoxCoordinates.origin.y < elementRect.bottom &&
  selectBoxCoordinates.origin.y + selectBoxCoordinates.dimension.height >
    elementRect.top;
