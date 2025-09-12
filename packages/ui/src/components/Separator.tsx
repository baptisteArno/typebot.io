import { Separator as SeparatorPrimitive } from "@base-ui-components/react/separator";
import { cn } from "../lib/cn";
import { cva } from "../lib/cva";

export const separatorClassNames = "bg-gray-5";

const separatorVariants = cva(separatorClassNames, {
  variants: {
    orientation: {
      vertical: "h-4 w-px",
      horizontal: "h-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export const Separator = ({
  className,
  ...props
}: SeparatorPrimitive.Props) => {
  return (
    <SeparatorPrimitive
      className={cn(
        separatorVariants({ orientation: props.orientation }),
        className,
      )}
      {...props}
    />
  );
};
