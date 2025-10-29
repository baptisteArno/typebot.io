import { Input as InputPrimitive } from "@base-ui-components/react/input";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { cva, type VariantProps } from "../lib/cva";

export const inputVariants = cva(
  `
  bg-transparent flex relative w-full overflow-visible rounded-md border transition-[box-shadow,border-color] border-gray-6 hover:border-gray-7 
  focus:outline-hidden focus:ring-orange-8 focus:ring-2 focus:border-transparent
  disabled:cursor-not-allowed disabled:opacity-50
  placeholder:text-muted-foreground
  file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
`,
  {
    variants: {
      size: {
        lg: "h-10 px-3 py-1 text-base",
        sm: "h-8 px-3 py-1 text-sm",
        none: "",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

export type InputProps = Omit<InputPrimitive.Props, "size"> &
  VariantProps<typeof inputVariants>;

const Input = forwardRef<
  HTMLInputElement,
  Omit<InputPrimitive.Props, "size"> & VariantProps<typeof inputVariants>
>(({ className, type, size, ...props }, ref) => {
  return (
    <InputPrimitive
      type={type}
      className={cn(inputVariants({ size }), className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
