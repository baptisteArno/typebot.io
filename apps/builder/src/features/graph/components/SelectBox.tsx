import { Box } from "@chakra-ui/react";
import type { Coordinates } from "../types";

type Props = {
  origin: Coordinates;
  dimension: {
    width: number;
    height: number;
  };
};

export const SelectBox = ({ origin, dimension }: Props) => (
  <Box
    pos="absolute"
    rounded="md"
    borderWidth={1}
    borderColor="orange.200"
    bgColor="rgba(255, 214, 199, 0.1)"
    style={{
      left: origin.x,
      top: origin.y,
      width: dimension.width,
      height: dimension.height,
    }}
  />
);
