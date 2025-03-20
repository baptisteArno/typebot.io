import {
  Combobox as ArkCombobox,
  type CollectionItem,
} from "@ark-ui/react/combobox";
import { useColorMode } from "@chakra-ui/react";
import { inputVariants } from "@typebot.io/ui/components/Input";
import { cn } from "@typebot.io/ui/lib/cn";
import type { VariantProps } from "@typebot.io/ui/lib/cva";
import { forwardRef } from "react";

const Root = forwardRef<HTMLDivElement, ArkCombobox.RootProps<CollectionItem>>(
  (props, ref) => {
    const { colorMode } = useColorMode();
    return (
      <ArkCombobox.Root
        ref={ref}
        {...props}
        openOnClick
        positioning={{
          gutter: 4,
          placement: "bottom-start",
        }}
        className={cn(props.className, colorMode === "dark" && "dark")}
      />
    );
  },
);

const Label = forwardRef<HTMLLabelElement, ArkCombobox.LabelProps>(
  (props, ref) => {
    return <ArkCombobox.Label ref={ref} {...props} />;
  },
);
Label.displayName = ArkCombobox.Label.displayName;

const Control = forwardRef<HTMLDivElement, ArkCombobox.ControlProps>(
  (props, ref) => {
    return <ArkCombobox.Control ref={ref} {...props} />;
  },
);
Control.displayName = ArkCombobox.Control.displayName;

const Input = forwardRef<
  HTMLInputElement,
  ArkCombobox.InputProps & VariantProps<typeof inputVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ArkCombobox.Input
      ref={ref}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
});
Input.displayName = ArkCombobox.Input.displayName;

const Positioner = forwardRef<HTMLDivElement, ArkCombobox.PositionerProps>(
  (props, ref) => {
    return <ArkCombobox.Positioner ref={ref} {...props} />;
  },
);
Positioner.displayName = ArkCombobox.Positioner.displayName;

const Content = forwardRef<HTMLDivElement, ArkCombobox.ContentProps>(
  (props, ref) => {
    const { colorMode } = useColorMode();
    return (
      <ArkCombobox.Content
        ref={ref}
        {...props}
        className={cn(props.className, colorMode === "dark" && "dark")}
      />
    );
  },
);
Content.displayName = ArkCombobox.Content.displayName;

const Item = forwardRef<HTMLDivElement, ArkCombobox.ItemProps>((props, ref) => {
  return <ArkCombobox.Item ref={ref} {...props} />;
});
Item.displayName = ArkCombobox.Item.displayName;
const ItemText = forwardRef<HTMLDivElement, ArkCombobox.ItemTextProps>(
  (props, ref) => {
    return <ArkCombobox.ItemText ref={ref} {...props} />;
  },
);
ItemText.displayName = ArkCombobox.ItemText.displayName;

export const Combobox = {
  Root,
  Control,
  Input,
  Positioner,
  Content,
  Item,
  ItemText,
  Label,
};
