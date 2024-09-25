import type { Coordinates } from "../types";

type Props = {
  sourcePosition: Coordinates;
  sourceTop: number;
  elementWidth: number;
};

export const computeSourceCoordinates = ({
  sourcePosition,
  sourceTop,
  elementWidth,
}: Props) => ({
  x: sourcePosition.x + elementWidth,
  y: sourceTop,
});
