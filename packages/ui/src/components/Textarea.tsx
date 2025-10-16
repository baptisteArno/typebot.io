import * as React from "react";
import { cn } from "../lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<React.ComponentProps<"textarea">, "onChange"> & {
    size?: "sm" | "default" | "lg" | "none" | number;
    onValueChange?: (value: string) => void;
  }
>(({ className, size = "default", onValueChange, ...props }, ref) => (
  <textarea
    {...props}
    data-slot="textarea"
    className={cn(
      "rounded-md border bg-gray-1 max-w-sm w-full px-4 py-2.5 outline-none ring-orange-7 transition-[color,border-color,box-shadow] focus:border-orange-8 focus:ring-[2px]",
      size === "none"
        ? "min-h-0"
        : "min-h-[calc(var(--spacing)*20.5)] resize-y",
      className,
    )}
    ref={ref}
    onChange={(e) => {
      onValueChange?.(e.target.value);
    }}
    // @ts-expect-error - TODO: remove once migrated to Tailwind v4
    style={{ ...props.style, fieldSizing: "content" }}
  />
));

Textarea.displayName = "Textarea";
