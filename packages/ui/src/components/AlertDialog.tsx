import { AlertDialog as AlertDialogPrimitive } from "@base-ui-components/react/alert-dialog";
import * as React from "react";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";

const Root = ({
  isOpen,
  onClose,
  ...props
}: AlertDialogPrimitive.Root.Props & {
  isOpen?: boolean;
  onClose?: () => void;
}) => (
  <AlertDialogPrimitive.Root
    open={isOpen}
    onOpenChange={(open) => !open && onClose?.()}
    {...props}
  />
);

const TriggerButton = ({
  children,
  variant,
  size,
  className,
  ...props
}: AlertDialogPrimitive.Trigger.Props &
  VariantProps<typeof buttonVariants> & {
    disabled?: boolean;
  }) => (
  <AlertDialogPrimitive.Trigger
    {...props}
    className={cn(buttonVariants({ variant, size }), className)}
    data-disabled={props.disabled}
  >
    {children}
  </AlertDialogPrimitive.Trigger>
);

const Title = ({ className, ...props }: AlertDialogPrimitive.Title.Props) => (
  <AlertDialogPrimitive.Title
    {...props}
    className={cn("text-2xl", className)}
  />
);

const Popup = ({
  className,
  children,
  initialFocus,
  ...props
}: AlertDialogPrimitive.Popup.Props) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Backdrop className="fixed inset-0 w-full bg-gray-12/50 data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out" />
    <div
      className={cn(
        "flex justify-center items-start fixed top-0 w-full py-12 h-full overflow-y-auto",
      )}
    >
      <AlertDialogPrimitive.Popup
        className={cn(
          "relative bg-gray-1 p-6 rounded-xl w-full max-w-xl data-open:animate-in data-open:slide-in-from-bottom-5 data-open:fade-in data-closed:animate-out data-closed:slide-out-to-bottom-5 data-closed:fade-out flex flex-col gap-4 shadow-md border data-nested-dialog-open:translate-y-2 data-nested-dialog-open:scale-[0.97] data-nested-dialog-open:blur-[1px] transition-transform",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </div>
  </AlertDialogPrimitive.Portal>
);

const Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cn("flex justify-end gap-2", className)}
    data-scope="dialog"
    data-part="footer"
  />
));

const CloseButton = React.forwardRef<
  HTMLButtonElement,
  AlertDialogPrimitive.Close.Props &
    VariantProps<typeof buttonVariants> & {
      className?: string;
    }
>(({ children, className, variant, size, ...props }, ref) => (
  <AlertDialogPrimitive.Close
    {...props}
    ref={ref}
    className={cn(buttonVariants({ variant, size }), className)}
  >
    {children}
  </AlertDialogPrimitive.Close>
));

export const AlertDialog = {
  Root,
  TriggerButton,
  Title,
  Popup,
  CloseButton,
  Footer,
};
