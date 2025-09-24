import { NumberField as NumberFieldPrimitive } from "@base-ui-components/react/number-field";
import { MinusSignIcon } from "../icons/MinusSignIcon";
import { PlusSignIcon } from "../icons/PlusSignIcon";
import { cn } from "../lib/cn";
import type { VariantProps } from "../lib/cva";
import { buttonVariants } from "./Button";
import { inputVariants } from "./Input";

const Root = ({ className, ...props }: NumberFieldPrimitive.Root.Props) => (
  <NumberFieldPrimitive.Root
    {...props}
    className={cn("flex flex-col gap-1", className)}
  />
);

const Group = ({ className, ...props }: NumberFieldPrimitive.Group.Props) => (
  <NumberFieldPrimitive.Group
    {...props}
    className={cn("flex items-center", className)}
  />
);

const Decrement = ({
  className,
  variant,
  ...props
}: NumberFieldPrimitive.Decrement.Props &
  Omit<VariantProps<typeof buttonVariants>, "size">) => (
  <NumberFieldPrimitive.Decrement
    {...props}
    className={cn(
      buttonVariants({ size: "icon", variant }),
      "size-10 rounded-r-none",
      className,
    )}
  >
    <MinusSignIcon />
  </NumberFieldPrimitive.Decrement>
);

const Increment = ({
  className,
  variant,
  ...props
}: NumberFieldPrimitive.Increment.Props &
  Omit<VariantProps<typeof buttonVariants>, "size">) => (
  <NumberFieldPrimitive.Increment
    {...props}
    className={cn(
      buttonVariants({ size: "icon", variant }),
      "size-10 rounded-l-none",
      className,
    )}
  >
    <PlusSignIcon />
  </NumberFieldPrimitive.Increment>
);

const Input = ({
  className,
  size,
  ...props
}: NumberFieldPrimitive.Input.Props & VariantProps<typeof inputVariants>) => (
  <NumberFieldPrimitive.Input
    {...props}
    className={cn(
      inputVariants({ size }),
      "rounded-l-none rounded-r-none",
      className,
    )}
  />
);

export const NumberField = {
  Root,
  Group,
  Decrement,
  Increment,
  Input,
};
