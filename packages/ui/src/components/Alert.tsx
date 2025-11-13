import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/cn";

const alertVariants = cva(
  "relative grid w-full items-start gap-x-2 gap-y-0.5 rounded-xl border px-3.5 py-3 text-sm text-card-foreground has-data-[slot=alert-action]:grid-cols-[1fr_auto] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-2 has-data-[slot=alert-action]:has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr_auto] [&>svg]:h-lh [&>svg]:w-4",
  {
    variants: {
      variant: {
        info: "border-blue-6 bg-blue-2 [&>svg]:text-blue-10",
        success: "border-green-6 bg-green-2 [&>svg]:text-green-10",
        warning: "border-orange-6 bg-orange-2 [&>svg]:text-orange-10",
        error: "border-red-6 bg-red-2 [&>svg]:text-red-10",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

function Root({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function Title({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium [svg~&]:col-start-2", className)}
      {...props}
    />
  );
}

function Description({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="alert-description"
      className={cn(
        "text-sm [p]:*:leading-relaxed [svg~&]:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

function Action({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "flex gap-1 max-sm:col-start-2 max-sm:mt-2 sm:row-start-1 sm:row-end-3 sm:self-center sm:[[data-slot=alert-description]~&]:col-start-2 sm:[[data-slot=alert-title]~&]:col-start-2 sm:[svg~&]:col-start-2 sm:[svg~[data-slot=alert-description]~&]:col-start-3 sm:[svg~[data-slot=alert-title]~&]:col-start-3",
        className,
      )}
      {...props}
    />
  );
}

export const Alert = { Root, Title, Description, Action };
