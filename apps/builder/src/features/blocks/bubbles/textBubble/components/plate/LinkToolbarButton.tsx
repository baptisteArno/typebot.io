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

  // Extract the pressed state and remove it from props to avoid DOM warning
  const { pressed, ...cleanProps } = props;

  return (
    <IconButton
      size="sm"
      variant={pressed ? "outline" : "ghost"}
      colorScheme={pressed ? "blue" : undefined}
      {...cleanProps}
      {...rest}
    />
  );
};
