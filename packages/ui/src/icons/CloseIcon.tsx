import React, { type SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
