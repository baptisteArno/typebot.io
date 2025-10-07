import { Combobox as ComboboxPrimitive } from "@base-ui-components/react/combobox";
import type * as React from "react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { cx, type VariantProps } from "../lib/cva";
import { inputVariants } from "./Input";

const Input = forwardRef<
  HTMLInputElement,
  Omit<ComboboxPrimitive.Input.Props, "size"> &
    VariantProps<typeof inputVariants>
>(({ className, size, ...props }, ref) => {
  return (
    <ComboboxPrimitive.Input
      className={cn(inputVariants({ size }), className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

function List({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.List>) {
  return <ComboboxPrimitive.List className={className} {...props} />;
}

function Popup({
  className,
  children,
  sideOffset = 2,
  ...props
}: ComboboxPrimitive.Popup.Props & {
  sideOffset?: ComboboxPrimitive.Positioner.Props["sideOffset"];
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner sideOffset={sideOffset} align="start">
        <ComboboxPrimitive.Popup
          className={cx(
            "border border-gray-4 w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-gray-1 py-2 shadow-lg",
            "data-[empty]:hidden",
            "data-[open]:animate-in data-[open]:fade-in-0",
            "data-[closed]:animate-out data-[closed]:fade-out-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-1",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-1",
            "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-1",
            "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-1",
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function Item({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      className="flex cursor-default py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded data-[highlighted]:before:bg-gray-3"
      {...props}
    />
  );
}

export const Combobox = {
  Root: ComboboxPrimitive.Root,
  Input,
  List,
  Item,
  Popup,
};
