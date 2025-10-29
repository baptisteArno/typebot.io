import { Popover as PopoverPrimitive } from "@base-ui-components/react/popover";
import * as React from "react";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

const Root = ({
  isOpen,
  onClose,
  onOpen,
  onCloseComplete,
  ...props
}: Omit<
  PopoverPrimitive.Root.Props,
  "open" | "onOpenChange" | "onOpenChangeComplete"
> & {
  isOpen?: boolean;
  onOpen?: (event?: Event) => void;
  onClose?: (event?: Event) => void;
  onCloseComplete?: () => void;
}) => (
  <PopoverPrimitive.Root
    open={isOpen}
    onOpenChange={(open, details) => {
      if (!open) {
        if (!onClose || !details) return;
        if (
          isOpen !== undefined &&
          (details.event.target as HTMLElement)?.closest(
            "[data-base-ui-click-trigger]",
          )
        )
          return;
        onClose(details.event);
      } else {
        onOpen?.(details.event);
      }
    }}
    onOpenChangeComplete={(open) => (open ? undefined : onCloseComplete?.())}
    {...props}
  />
);

const Trigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  Omit<PopoverPrimitive.Trigger.Props, "nativeButton" | "render"> & {
    render?: (props: any) => React.ReactElement | React.ReactElement;
  }
>(({ className, render, children, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    {...props}
    className={className}
    ref={ref}
    nativeButton={false}
    render={render ?? <span />}
  >
    {children}
  </PopoverPrimitive.Trigger>
));
Trigger.displayName = PopoverPrimitive.Trigger.displayName;

const TriggerButton = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  PopoverPrimitive.Trigger.Props & VariantProps<typeof buttonVariants>
>(({ children, className, variant, size, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    {...props}
    className={cn(buttonVariants({ variant, size }), className)}
    ref={ref}
    data-disabled={props.disabled}
  >
    {children}
  </PopoverPrimitive.Trigger>
));
TriggerButton.displayName = PopoverPrimitive.Trigger.displayName;

const Popup = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Popup>,
  PopoverPrimitive.Popup.Props & {
    offset?: number;
    side?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
    align?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
    matchWidth?: boolean;
  }
>(
  (
    {
      children,
      className,
      offset = 8,
      side = "bottom",
      align = "center",
      matchWidth = false,
      ...props
    },
    ref,
  ) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          sideOffset={offset}
          side={side}
          align={align}
        >
          <PopoverPrimitive.Popup
            {...props}
            ref={ref}
            className={cn(
              "bg-gray-1 p-2 rounded-lg border overflow-auto border-gray-4 shadow-md max-h-(--available-height) max-w-(--available-width) flex flex-col gap-2",
              "data-open:animate-in data-open:fade-in-0",
              "data-closed:animate-out data-closed:fade-out-0",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
              "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
              "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
              "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
              matchWidth && "min-w-(--anchor-width)",
              className,
            )}
          >
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    );
  },
);

export const Popover = {
  Root,
  Trigger,
  TriggerButton,
  Popup,
};
