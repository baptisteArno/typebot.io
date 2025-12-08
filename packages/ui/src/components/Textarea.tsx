import * as React from "react";
import { cn } from "../lib/cn";

export type TextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "onChange"
> & {
  size?: "sm" | "default" | "lg" | "none" | number;
  onValueChange?: (value: string) => void;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "default", onValueChange, ...props }, ref) => (
    <textarea
      {...props}
      data-slot="textarea"
      className={cn(
        "rounded-md border bg-gray-1 max-w-sm w-full px-4 py-2.5 outline-hidden ring-orange-7 transition-[color,border-color,box-shadow] focus:border-orange-8 focus:ring-2 field-sizing-content",
        size === "none" ? "min-h-0" : "min-h-20.5 resize-y",
        className,
      )}
      ref={ref}
      onChange={(e) => {
        onValueChange?.(e.target.value);
      }}
    />
  ),
);

Textarea.displayName = "Textarea";
