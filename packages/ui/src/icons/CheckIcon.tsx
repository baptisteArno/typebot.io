import type { SVGProps } from "react";
import { defaultLucideIconsProps } from "./constants";

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaultLucideIconsProps} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
