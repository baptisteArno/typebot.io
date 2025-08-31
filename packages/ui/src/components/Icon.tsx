// import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export type IconProps = {
  icon: any;
  className?: string;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, ...props }, ref) => {
    return <></>;
  },
);
