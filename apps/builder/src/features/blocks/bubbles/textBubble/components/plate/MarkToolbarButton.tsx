import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from "@udecode/plate-common";
import React from "react";

type Props = {
  nodeType: string;
  clear?: string | string[];
} & IconButtonProps;

export const MarkToolbarButton = ({ clear, nodeType, ...rest }: Props) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

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
