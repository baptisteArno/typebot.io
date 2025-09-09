import { Stack } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { SwitchWithLabelProps } from "./inputs/SwitchWithLabel";
import { SwitchWithLabel } from "./inputs/SwitchWithLabel";

type Props = SwitchWithLabelProps;

export const SwitchWithRelatedSettings = forwardRef<HTMLDivElement, Props>(
  ({ children, ...props }, ref) => (
    <Stack
      ref={ref}
      borderWidth={props.initialValue ? 1 : undefined}
      rounded="md"
      p={props.initialValue ? "3" : undefined}
      spacing={4}
    >
      <SwitchWithLabel {...props} />
      {props.initialValue && children}
    </Stack>
  ),
);
