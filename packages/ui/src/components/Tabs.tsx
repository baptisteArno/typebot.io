import { Tabs as TabsPrimitive } from "@base-ui-components/react/tabs";
import { cn } from "../lib/cn";

type TabsVariant = "default" | "underline";

function Root({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
        className,
      )}
      {...props}
    />
  );
}

function List({
  variant = "default",
  className,
  children,
  ...props
}: TabsPrimitive.List.Props & {
  variant?: TabsVariant;
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-gray-12",
        "data-[orientation=vertical]:flex-col",
        variant === "default"
          ? "rounded-lg bg-gray-3 p-0.5 text-gray-12/64"
          : "data-[orientation=horizontal]:py-1 data-[orientation=vertical]:px-1 hover:data-[slot=tabs-trigger]:*:bg-gray-2",
        className,
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tab-indicator"
        className={cn(
          "absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out",
          variant === "underline"
            ? "z-10 bg-orange-9 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:translate-y-px data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px"
            : "-z-10 rounded-md bg-gray-1 shadow-xs dark:bg-gray-2",
        )}
      />
    </TabsPrimitive.List>
  );
}

function Tab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "flex flex-1 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-hidden focus-visible:ring-2 focus-visible:ring-orange-8 data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "hover:text-gray-12 data-selected:text-gray-12",
        "gap-1.5 px-3 py-1",
        "data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start",
        className,
      )}
      {...props}
    />
  );
}

function Panel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-hidden", className)}
      {...props}
    />
  );
}

export const Tabs = { Root, List, Tab, Panel };
