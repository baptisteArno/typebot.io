import type { SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const LinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);
