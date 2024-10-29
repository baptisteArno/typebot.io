import React, { type SVGProps } from "react";
import { defaultIconProps } from "./constants";

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
