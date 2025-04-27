import { featherIconsBaseProps } from "@/components/icons";
import { Icon, type IconProps } from "@chakra-ui/react";
import React from "react";

export const ReturnBlockIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    <path d="M3 7v6h6" />
    <circle cx="12" cy="17" r="1" />
  </Icon>
);
