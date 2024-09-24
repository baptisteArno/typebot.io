import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from "@udecode/plate-link";
import React from "react";

type Props = IconButtonProps;

export const LinkToolbarButton = ({ ...rest }: Props) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <IconButton
      size="sm"
      variant={props.pressed ? "outline" : "ghost"}
      colorScheme={props.pressed ? "blue" : undefined}
      {...props}
      {...rest}
    />
  );
};
