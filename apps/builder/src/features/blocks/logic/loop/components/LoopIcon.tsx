import { featherIconsBaseProps } from "@/components/icons";
import { Icon, type IconProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export const LoopIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 24 24"
    color={useColorModeValue("purple.500", "purple.300")}
    {...featherIconsBaseProps}
    {...props}
  >
    <path d="M17 2.1l4 4-4 4" />
    <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8" />
    <path d="M7 21.9l-4-4 4-4" />
    <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
  </Icon>
);
