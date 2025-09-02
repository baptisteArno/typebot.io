import { forwardRef } from "react";
import { cn } from "../lib/cn";

export type IconProps = {
  children: React.ReactNode;
  className?: string;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        className={cn(
          "size-4 stroke-[1.5px] inline-flex flex-shrink-0",
          className,
        )}
        {...props}
      >
        {children}
      </svg>
    );
  },
);
