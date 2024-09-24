import { roundCorners } from "svg-round-corners";
import {
  dropOffBoxDimensions,
  dropOffSegmentLength,
  dropOffStubLength,
} from "../components/edges/DropOffEdge";
import { pathRadius } from "../constants";
import type { Coordinates } from "../types";
import { computeTwoSegments } from "./segments";

export const computeDropOffPath = (
  sourcePosition: Coordinates,
  isLastBlock = false,
) => {
  const segments = computeTwoSegments(sourcePosition, {
    x:
      sourcePosition.x +
      (isLastBlock
        ? dropOffStubLength + dropOffBoxDimensions.width / 2
        : dropOffStubLength),
    y: sourcePosition.y + (isLastBlock ? dropOffSegmentLength : 0),
  });
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    pathRadius,
  ).path;
};
