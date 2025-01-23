import type { SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const DatabaseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);
