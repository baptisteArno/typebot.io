import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import { ArrowDown01Icon } from "../icons/ArrowDown01Icon";
import { cn } from "../lib/cn";

function Root({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full -space-y-px", className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "bg-gray-1 relative border outline-hidden first:rounded-t-md last:rounded-b-md last:border-b",
        className,
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex font-body font-normal">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:ring-orange-9/50 flex flex-1 items-center justify-between gap-4 rounded-md text-left text-sm font-semibold transition-all outline-hidden disabled:pointer-events-none disabled:opacity-50 [&[data-panel-open]>svg]:rotate-180 text-[15px] leading-6 hover:no-underline focus-visible:ring-0 px-4 py-3",
          className,
        )}
        {...props}
      >
        {children}
        <ArrowDown01Icon
          className="pointer-events-none shrink-0 opacity-60 transition-transform"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function Panel({
  className,
  children,
  style,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) transition-[height] data-ending-style:h-0 data-starting-style:h-0 overflow-y-clip"
      {...props}
    >
      <div className={cn("py-2 pb-4 px-4 gap-2 flex flex-col", className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export const Accordion = {
  Root,
  Item,
  Trigger,
  Panel,
};
