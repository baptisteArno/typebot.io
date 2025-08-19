import { Select as PrimitiveSelect } from "@base-ui-components/react/select";
import * as React from "react";
import { CheckIcon } from "../icons/CheckIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { cn } from "../lib/cn";
import { type VariantProps, cva, cx } from "../lib/cva";

const Root = <Value,>(props: PrimitiveSelect.Root.Props<Value>) => (
  <PrimitiveSelect.Root {...props} />
);

const triggerVariants = cva(
  cx(
    "flex items-center justify-between gap-2 rounded-md transition-colors flex-shrink-0 bg-transparent border border-gray-7 text-gray-12 hover:bg-gray-2 active:bg-gray-4 cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-orange-8 outline-none",
  ),
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type TriggerProps = PrimitiveSelect.Trigger.Props &
  VariantProps<typeof triggerVariants>;

const Trigger = React.forwardRef<
  React.ElementRef<typeof PrimitiveSelect.Trigger>,
  TriggerProps
>(({ size, className, ...props }, ref) => (
  <PrimitiveSelect.Trigger
    {...props}
    ref={ref}
    className={cn(triggerVariants({ size }), className)}
  >
    <PrimitiveSelect.Value />
    <PrimitiveSelect.Icon className="flex">
      <ChevronDownIcon className="size-4" />
    </PrimitiveSelect.Icon>
  </PrimitiveSelect.Trigger>
));
Trigger.displayName = PrimitiveSelect.Trigger.displayName;

const popupVariants = cva(
  cx(
    "group bg-gray-1 dark:bg-gray-2 p-1 rounded-lg shadow-lg border overflow-auto",
    "origin-[var(--transform-origin)] max-h-[var(--available-height)] max-w-[var(--available-width)]",
    "data-[open]:animate-in data-[open]:fade-in-0",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
    "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
    "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
    "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
  ),
  {
    variants: {
      size: {
        default: "",
        sm: "text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const Popup = ({
  className,
  size,
  ...props
}: PrimitiveSelect.Popup.Props & VariantProps<typeof popupVariants>) => (
  <PrimitiveSelect.Portal>
    <PrimitiveSelect.Positioner
      className="outline-none select-none"
      sideOffset={8}
    >
      <PrimitiveSelect.ScrollUpArrow className="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-t-md bg-gray-1 border-t border-x text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
      <PrimitiveSelect.Popup
        className={cn(popupVariants({ size }), className)}
        {...props}
      />
      <PrimitiveSelect.ScrollDownArrow
        className={cx(
          "bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-b-md bg-gray-1 border-b border-x text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]",
        )}
      />
    </PrimitiveSelect.Positioner>
  </PrimitiveSelect.Portal>
);

const Item = ({
  children,
  ...props
}: React.ComponentProps<typeof PrimitiveSelect.Item>) => (
  <PrimitiveSelect.Item
    {...props}
    className={cx(
      "min-w-[var(--anchor-width)] data-[highlighted]:bg-gray-2 dark:data-[highlighted]:bg-gray-3 p-2 rounded-md cursor-default flex items-center gap-2",
      "focus-visible:ring-2 focus-visible:ring-orange-8 outline-none",
      "group-data-[side=none]:min-w-[calc(var(--anchor-width)+10px)]",
    )}
  >
    <PrimitiveSelect.ItemIndicator>
      <CheckIcon className="size-3" />
    </PrimitiveSelect.ItemIndicator>
    <PrimitiveSelect.ItemText>{children}</PrimitiveSelect.ItemText>
  </PrimitiveSelect.Item>
);

export const Select = {
  Root,
  Trigger,
  Popup,
  Item,
};
