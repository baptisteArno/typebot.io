import { ContextMenu as ContextMenuPrimitive } from "@base-ui-components/react/context-menu";
import * as React from "react";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

const Root = ContextMenuPrimitive.Root;

const Trigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
  ContextMenuPrimitive.Trigger.Props
>(({ children, className, ...props }, ref) => (
  <ContextMenuPrimitive.Trigger {...props} className={className} ref={ref}>
    {children}
  </ContextMenuPrimitive.Trigger>
));
Trigger.displayName = ContextMenuPrimitive.Trigger.displayName;

const TriggerButton = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
  ContextMenuPrimitive.Trigger.Props &
    VariantProps<typeof buttonVariants> & {
      disabled?: boolean;
    }
>(({ children, className, variant, size, ...props }, ref) => (
  <ContextMenuPrimitive.Trigger
    {...props}
    className={cn(buttonVariants({ variant, size }), className)}
    ref={ref}
    data-disabled={props.disabled}
  >
    {children}
  </ContextMenuPrimitive.Trigger>
));
TriggerButton.displayName = ContextMenuPrimitive.Trigger.displayName;

const Popup = ({
  children,
  className,
  offset = 8,
  side = "bottom",
  align = "center",
  ...props
}: ContextMenuPrimitive.Popup.Props & {
  offset?: number;
  side?: ContextMenuPrimitive.Positioner.Props["side"];
  align?: ContextMenuPrimitive.Positioner.Props["align"];
}) => {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        sideOffset={offset}
        side={side}
        align={align}
        className="outline-hidden"
      >
        <ContextMenuPrimitive.Popup
          {...props}
          className={cn(
            "outline-hidden bg-gray-1 p-1 rounded-lg border overflow-auto border-gray-4 shadow-md max-h-(--available-height) max-w-(--available-width) flex flex-col",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
            "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
            "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
            className,
          )}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
};

const Item = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) => (
  <ContextMenuPrimitive.Item
    {...props}
    className={cn(
      "outline-hidden min-w-(--anchor-width) data-highlighted:bg-gray-2 dark:data-highlighted:bg-gray-3 p-2 rounded-md cursor-default flex items-center gap-2",
      className,
    )}
  >
    {children}
  </ContextMenuPrimitive.Item>
);

const SubmenuRoot = ContextMenuPrimitive.SubmenuRoot;

const SubmenuTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubmenuTrigger>,
  ContextMenuPrimitive.SubmenuTrigger.Props
>(({ children, className, ...props }, ref) => (
  <ContextMenuPrimitive.SubmenuTrigger
    {...props}
    className={cn(
      "outline-hidden min-w-(--anchor-width) data-highlighted:bg-gray-2 dark:data-highlighted:bg-gray-3 p-2 rounded-md cursor-default flex items-center gap-2",
      className,
    )}
    ref={ref}
  >
    {children}
  </ContextMenuPrimitive.SubmenuTrigger>
));
SubmenuTrigger.displayName = ContextMenuPrimitive.SubmenuTrigger.displayName;

export const ContextMenu = {
  Root,
  Trigger,
  TriggerButton,
  Popup,
  SubmenuRoot,
  SubmenuTrigger,
  Item,
};
