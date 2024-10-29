import React, { type SVGProps } from "react";
import { defaultIconProps } from "./constants";

export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultIconProps} {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
