import { Text } from "@chakra-ui/react";
import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import React from "react";

type Props = {
  options: PixelBlock["options"];
};

export const PixelNodeBody = ({ options }: Props) => (
  <Text
    color={options?.eventType || options?.pixelId ? "currentcolor" : "gray.500"}
    noOfLines={1}
  >
    {options?.eventType
      ? `Track "${options.eventType}"`
      : options?.pixelId
        ? "Init Pixel"
        : "Configure..."}
  </Text>
);
