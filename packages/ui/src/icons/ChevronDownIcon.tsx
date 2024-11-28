import React, { type SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
