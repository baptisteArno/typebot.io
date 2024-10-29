import { Icon, type IconProps } from "@chakra-ui/icon";
import React from "react";
import { defaultIconProps } from "./constants";

export const CloseIcon = (props: IconProps) => (
  <Icon {...defaultIconProps} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
