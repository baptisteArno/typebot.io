import React, { type SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
