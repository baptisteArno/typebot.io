import { Menu as MenuPrimitive } from "@base-ui-components/react/menu";
import * as React from "react";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

const Root = MenuPrimitive.Root;

const Trigger = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Trigger>,
  MenuPrimitive.Trigger.Props
>(({ children, className, ...props }, ref) => (
  <MenuPrimitive.Trigger
    {...props}
    className={className}
    ref={ref}
    nativeButton={false}
  >
    {children}
  </MenuPrimitive.Trigger>
));
Trigger.displayName = MenuPrimitive.Trigger.displayName;

const TriggerButton = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Trigger>,
  MenuPrimitive.Trigger.Props & VariantProps<typeof buttonVariants>
>(({ children, className, variant, size, ...props }, ref) => (
  <MenuPrimitive.Trigger
    {...props}
    className={cn(buttonVariants({ variant, size }), className)}
    ref={ref}
    data-disabled={props.disabled}
  >
    {children}
  </MenuPrimitive.Trigger>
));
TriggerButton.displayName = MenuPrimitive.Trigger.displayName;

const Popup = ({
  children,
  className,
  offset = 8,
  side = "bottom",
  align = "center",
  ...props
}: MenuPrimitive.Popup.Props & {
  offset?: number;
  side?: MenuPrimitive.Positioner.Props["side"];
  align?: MenuPrimitive.Positioner.Props["align"];
}) => {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={offset} side={side} align={align}>
        <MenuPrimitive.Popup
          {...props}
          className={cn(
            "bg-gray-1 p-1 rounded-lg border overflow-auto border-gray-4 shadow-md max-h-[var(--available-height)] max-w-[var(--available-width)] flex flex-col",
            "data-[open]:animate-in data-[open]:fade-in-0",
            "data-[closed]:animate-out data-[closed]:fade-out-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
            "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
            "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
            className,
          )}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
};

const Item = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) => (
  <MenuPrimitive.Item
    {...props}
    className={cn(
      "min-w-[var(--anchor-width)] data-[highlighted]:bg-gray-2 dark:data-[highlighted]:bg-gray-3 p-2 rounded-md cursor-default flex items-center gap-2",
      className,
    )}
  >
    {children}
  </MenuPrimitive.Item>
);

const SubmenuRoot = MenuPrimitive.SubmenuRoot;

const SubmenuTrigger = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.SubmenuTrigger>,
  MenuPrimitive.SubmenuTrigger.Props
>(({ children, className, ...props }, ref) => (
  <MenuPrimitive.SubmenuTrigger {...props} className={className} ref={ref} />
));
SubmenuTrigger.displayName = MenuPrimitive.SubmenuTrigger.displayName;

export const Menu = {
  Root,
  Trigger,
  TriggerButton,
  Popup,
  SubmenuRoot,
  SubmenuTrigger,
  Item,
};
