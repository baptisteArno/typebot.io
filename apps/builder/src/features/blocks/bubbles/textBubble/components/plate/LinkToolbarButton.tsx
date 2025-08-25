import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from "@udecode/plate-link";
import React from "react";

type Props = ButtonProps;

export const LinkToolbarButton = (compProps: Props) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <Button
      size="icon"
      variant={props.pressed ? "outline" : "ghost"}
      {...props}
      {...compProps}
    >
      {compProps.children}
    </Button>
  );
};
