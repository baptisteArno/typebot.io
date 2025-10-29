import type { Coordinates } from "../types";

type Props = {
  origin: Coordinates;
  dimension: {
    width: number;
    height: number;
  };
};

export const SelectBox = ({ origin, dimension }: Props) => (
  <div
    className="fixed rounded-md border border-orange-6 bg-orange-6/10"
    style={{
      left: origin.x,
      top: origin.y,
      width: dimension.width,
      height: dimension.height,
    }}
  />
);
