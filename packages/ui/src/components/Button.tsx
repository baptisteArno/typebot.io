import * as React from "react";
import { cn } from "../lib/cn";
import { type VariantProps, cva, cx } from "../lib/cva";

const buttonVariants = cva(
  cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer select-none flex-shrink-0",
    "focus-visible:ring-2 focus-visible:ring-orange-8 outline-none",
    // We don't use `disabled:` so that the styling works with custom asChild elements
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-orange-9 hover:bg-orange-10 active:bg-orange-11 text-gray-1 dark:text-gray-12",
        secondary: "bg-gray-3 hover:bg-gray-4 active:bg-gray-5",
        outline: "bg-transparent border border-orange-8 text-orange-11",
        "outline-secondary":
          "bg-transparent border border-gray-7 text-gray-12 hover:bg-gray-2 active:bg-gray-4",
        ghost: "text-gray-12 bg-transparent hover:bg-gray-4 active:bg-gray-5",
        destructive:
          "bg-red-9 hover:bg-red-10 active:bg-red-11 text-gray-1 dark:text-gray-12",
        link: "text-orange-11 underline-offset-4 hover:underline",
        cta: "text-white bg-gradient-to-b border border-[#C4461D] from-[#FF8963] to-[#FF5A25] to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.25)] active:from-[#E44A19] active:to-[#EF744C] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-2px_2px_0_rgba(255,255,255,0.17)] before:bg-transparent hover:before:bg-white/50 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2]",
        ctaSecondary:
          "text-white bg-gradient-to-b border border-gray-12 from-[#282828] to-gray-12 to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.10)] active:from-gray-12 active:to-[#282828] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-3px_2px_0_rgba(255,255,255,0.10)] before:bg-transparent hover:before:bg-white/30 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2] ",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3",
        lg: "h-11 px-6 rounded-lg text-base",
        icon: "size-9 leading-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const createButtonElement = (elementProps: ButtonProps) => {
    const additionalProps = {
      // Used to style custom button elements like label element on which disabled is not valid attribute
      "data-disabled": elementProps.disabled,
    };
    if (asChild) {
      const { children, ...restProps } = elementProps;
      const child = React.Children.only(children);
      return React.cloneElement(child as React.ReactElement, {
        className: cn(
          buttonVariants({ variant, size }),
          className,
          (child as React.ReactElement).props?.className,
        ),
        ref,
        ...restProps,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...elementProps}
        {...additionalProps}
      />
    );
  };

  return createButtonElement(props);
});

export { Button, buttonVariants };
