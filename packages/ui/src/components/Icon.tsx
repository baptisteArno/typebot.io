import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export type IconProps = {
  icon: IconSvgElement;
  className?: string;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        size={16}
        strokeWidth={1.5}
        className={cn("inline-flex", className)}
        {...props}
      />
    );
  },
);
