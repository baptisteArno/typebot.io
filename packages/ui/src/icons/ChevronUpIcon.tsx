import React, { type SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const ChevronUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);
