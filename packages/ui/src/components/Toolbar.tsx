import { Toolbar as ToolbarPrimitive } from "@base-ui-components/react/toolbar";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { separatorClassNames } from "./Separator";

export type ToolbarRootProps = ToolbarPrimitive.Root.Props;
const Root = forwardRef<HTMLDivElement, ToolbarPrimitive.Root.Props>(
  ({ className, ...props }: ToolbarPrimitive.Root.Props, ref) => {
    return (
      <ToolbarPrimitive.Root
        {...props}
        className={cn(
          "flex gap-px items-center select-none rounded-lg border p-1 bg-gray-1",
          className,
        )}
        ref={ref}
      />
    );
  },
);

const Group = ({
  className,
  ...props
}: ToolbarPrimitive.Group.Props & {
  "aria-label": string;
}) => {
  return (
    <ToolbarPrimitive.Group
      {...props}
      className={cn("flex gap-1", className)}
    />
  );
};

const Button = forwardRef<HTMLButtonElement, ToolbarPrimitive.Button.Props>(
  ({ className, ...props }: ToolbarPrimitive.Button.Props, ref) => {
    return (
      <ToolbarPrimitive.Button
        {...props}
        className={cn(
          "flex w-7 h-7 items-center justify-center rounded-md px-3 font-[inherit] text-sm font-medium text-gray-11 select-none",
          "focus-visible:ring-2 focus-visible:ring-orange-8 outline-hidden",
          "hover:bg-gray-2 active:bg-gray-3 data-pressed:bg-gray-3 data-pressed:text-gray-12",
          className,
        )}
        ref={ref}
      />
    );
  },
);

const Separator = ({
  className,
  ...props
}: ToolbarPrimitive.Separator.Props) => {
  return (
    <ToolbarPrimitive.Separator
      {...props}
      className={cn(separatorClassNames, className)}
    />
  );
};

export const Toolbar = {
  Root,
  Group,
  Button,
  Separator,
};
