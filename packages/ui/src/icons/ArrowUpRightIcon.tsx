import type { SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const ArrowUpRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);
