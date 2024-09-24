import { Icon, type IconProps } from "@chakra-ui/icon";
import React from "react";

export const DontIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 150 150"
    boxSize="50px"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="150" height="150" rx="75" fill="#F87171" fillOpacity="0.8" />
    <path
      d="M100 50L50 100"
      stroke="white"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M50 50L100 100"
      stroke="white"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
