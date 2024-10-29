import React, { type SVGProps } from "react";
import { defaultIconProps } from "./constants";

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
