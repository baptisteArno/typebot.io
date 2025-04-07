import { Editable as ArkEditable } from "@ark-ui/react/editable";
import { useColorMode } from "@chakra-ui/react";
import { inputVariants } from "@typebot.io/ui/components/Input";
import { cn } from "@typebot.io/ui/lib/cn";
import { forwardRef } from "react";

const Root = forwardRef<HTMLDivElement, ArkEditable.RootProps>((props, ref) => {
  const { colorMode } = useColorMode();
  return (
    <ArkEditable.Root
      ref={ref}
      autoResize={false}
      {...props}
      className={cn(colorMode === "dark" && "dark", props.className)}
    />
  );
});

const Area = forwardRef<HTMLDivElement, ArkEditable.AreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ArkEditable.Area
        ref={ref}
        className={cn("w-full flex", className)}
        {...props}
      />
    );
  },
);

const Input = forwardRef<HTMLInputElement, ArkEditable.InputProps>(
  ({ className, ...props }, ref) => (
    <ArkEditable.Input
      ref={ref}
      className={cn(
        inputVariants({ variant: "noSize" }),
        "px-[3px] py-[3px] font-inherit text-align-inherit",
        className,
      )}
      {...props}
    />
  ),
);

const Textarea = forwardRef<HTMLInputElement, ArkEditable.InputProps>(
  ({ className, ...props }, ref) => (
    <ArkEditable.Input ref={ref} {...props} asChild>
      <textarea
        className={cn(
          inputVariants({ variant: "noSize" }),
          "px-[3px] py-[3px] font-inherit text-align-inherit",
          className,
        )}
      />
    </ArkEditable.Input>
  ),
);

const Preview = forwardRef<
  HTMLDivElement,
  ArkEditable.PreviewProps & { isMultiLine?: boolean }
>(({ className, style, isMultiLine, ...props }, ref) => (
  <ArkEditable.Preview
    ref={ref}
    className={cn(
      "cursor-pointer rounded-md hover:bg-gray-3 transition-colors p-1 w-full",
      className,
    )}
    style={{
      ...style,
      whiteSpace: "pre-line",
    }}
    {...props}
  />
));

export const Editable = { Root, Area, Input, Preview, Textarea };
