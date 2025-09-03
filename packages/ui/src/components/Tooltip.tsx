import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";
import type * as React from "react";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

const Root = ({
  children,
  isOpen,
  onOpen,
  onClose,
  keepOpenOnClick,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  keepOpenOnClick?: boolean;
}) => {
  return (
    <TooltipPrimitive.Root
      open={isOpen}
      onOpenChange={(open, event) => {
        if (
          open ||
          (keepOpenOnClick &&
            ["click", "pointerdown"].includes(event?.type ?? ""))
        ) {
          onOpen?.();
        } else {
          onClose?.();
        }
      }}
      {...props}
    >
      {children}
    </TooltipPrimitive.Root>
  );
};

const Trigger = ({
  render = <span />,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => (
  <TooltipPrimitive.Trigger {...props} render={render} />
);

const TriggerButton = ({
  children,
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> &
  VariantProps<typeof buttonVariants>) => (
  <TooltipPrimitive.Trigger
    {...props}
    className={cn(buttonVariants({ variant, size }), className)}
    data-disabled={props.disabled}
  >
    {children}
  </TooltipPrimitive.Trigger>
);

const Popup = ({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
  offset?: number;
  side?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["side"];
  align?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["align"];
}) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={8} side="top" align="center">
        <TooltipPrimitive.Popup
          {...props}
          className={cn(
            "bg-gray-1 px-2 py-1 text-sm rounded-lg border border-gray-4 shadow-md",
            "data-[open]:animate-in data-[open]:fade-in-0",
            "data-[closed]:animate-out data-[closed]:fade-out-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
            "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
            "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
            className,
          )}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
};

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = {
  Root,
  Trigger,
  TriggerButton,
  Popup,
};
