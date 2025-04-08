import { Field as ArkField } from "@ark-ui/react/field";
import { cn } from "@typebot.io/ui/lib/cn";
import { forwardRef } from "react";

const Root = forwardRef<HTMLDivElement, ArkField.RootProps>((props, ref) => {
  return <ArkField.Root ref={ref} {...props} />;
});

const HelperText = forwardRef<HTMLDivElement, ArkField.HelperTextProps>(
  ({ ...props }, ref) => {
    return (
      <ArkField.HelperText
        ref={ref}
        {...props}
        className={cn(props.className, "text-sm text-gray-10")}
      />
    );
  },
);

export const Field = {
  Root,
  HelperText,
};
