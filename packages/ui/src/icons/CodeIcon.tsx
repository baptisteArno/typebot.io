import type { SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const CodeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
