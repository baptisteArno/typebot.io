import { Icon, type IconProps } from "@chakra-ui/react";
import React from "react";
import { featherIconsBaseProps } from "./HamburgerIcon";

export const CloseIcon = (props: IconProps) => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {...featherIconsBaseProps}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </Icon>
);
