import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from "@udecode/plate-common";
import React from "react";

type Props = {
  nodeType: string;
  clear?: string | string[];
} & ButtonProps;

export const MarkToolbarButton = ({
  clear,
  nodeType,
  children,
  ...rest
}: Props) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return (
    <Button
      size="icon"
      variant={props.pressed ? "outline" : "ghost"}
      {...props}
      {...rest}
    >
      {children}
    </Button>
  );
};
