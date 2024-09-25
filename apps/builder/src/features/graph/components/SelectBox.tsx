import { headerHeight } from "@/features/editor/constants";
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
    borderColor="blue.200"
    bgColor="rgba(0, 66, 218, 0.1)"
    style={{
      left: origin.x,
      top: origin.y - headerHeight,
      width: dimension.width,
      height: dimension.height,
      zIndex: 1000,
    }}
  />
);
