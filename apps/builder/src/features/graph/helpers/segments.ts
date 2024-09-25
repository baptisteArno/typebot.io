import { stubLength } from "../constants";
import type { AnchorsPositionProps, Coordinates } from "../types";

export const getSegments = ({
  sourcePosition,
  targetPosition,
  sourceType,
  totalSegments,
}: AnchorsPositionProps) => {
  switch (totalSegments) {
    case 2:
      return computeTwoSegments(sourcePosition, targetPosition);
    case 3:
      return computeThreeSegments(sourcePosition, targetPosition, sourceType);
    case 4:
      return computeFourSegments(sourcePosition, targetPosition, sourceType);
    default:
      return computeFiveSegments(sourcePosition, targetPosition, sourceType);
  }
};

export const computeTwoSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
) => {
  const segments = [];
  segments.push(`L${targetPosition.x},${sourcePosition.y}`);
  segments.push(`L${targetPosition.x},${targetPosition.y}`);
  return segments.join(" ");
};

export const computeThreeSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: "right" | "left",
) => {
  const segments = [];
  const firstSegmentX =
    sourceType === "right"
      ? sourcePosition.x + (targetPosition.x - sourcePosition.x) / 2
      : sourcePosition.x - (sourcePosition.x - targetPosition.x) / 2;
  segments.push(`L${firstSegmentX},${sourcePosition.y}`);
  segments.push(`L${firstSegmentX},${targetPosition.y}`);
  segments.push(`L${targetPosition.x},${targetPosition.y}`);
  return segments.join(" ");
};

export const computeFourSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: "right" | "left",
) => {
  const segments = [];
  const firstSegmentX =
    sourcePosition.x + (sourceType === "right" ? stubLength : -stubLength);
  segments.push(`L${firstSegmentX},${sourcePosition.y}`);
  const secondSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) - stubLength;
  segments.push(`L${firstSegmentX},${secondSegmentY}`);

  segments.push(`L${targetPosition.x},${secondSegmentY}`);

  segments.push(`L${targetPosition.x},${targetPosition.y}`);
  return segments.join(" ");
};

export const computeFiveSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: "right" | "left",
) => {
  const segments = [];
  const firstSegmentX =
    sourcePosition.x + (sourceType === "right" ? stubLength : -stubLength);
  segments.push(`L${firstSegmentX},${sourcePosition.y}`);
  const firstSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) / 2;
  segments.push(
    `L${
      sourcePosition.x + (sourceType === "right" ? stubLength : -stubLength)
    },${firstSegmentY}`,
  );

  const secondSegmentX =
    targetPosition.x - (sourceType === "right" ? stubLength : -stubLength);
  segments.push(`L${secondSegmentX},${firstSegmentY}`);

  segments.push(`L${secondSegmentX},${targetPosition.y}`);

  segments.push(`L${targetPosition.x},${targetPosition.y}`);
  return segments.join(" ");
};
