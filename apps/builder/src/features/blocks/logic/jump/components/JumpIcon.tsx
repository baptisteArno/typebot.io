import { featherIconsBaseProps } from "@/components/icons";
import { Icon, type IconProps } from "@chakra-ui/react";
import React from "react";

export const JumpIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polygon points="13 19 22 12 13 5 13 19"></polygon>
    <polygon points="2 19 11 12 2 5 2 19"></polygon>
  </Icon>
);
