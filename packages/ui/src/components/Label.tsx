/** biome-ignore-all lint/a11y/noLabelWithoutControl: false positive */
import type * as React from "react";
import { cn } from "../lib/cn";

export const Label = ({
  className,
  ...props
}: React.ComponentProps<"label">) => {
  return (
    <label
      data-slot="label"
      className={cn(
        "inline-flex font-medium items-center gap-2 text-sm/4 has-data-checked:border-orange-7 has-data-checked:bg-gray-2/50 transition-colors",
        className,
      )}
      {...props}
    />
  );
};
