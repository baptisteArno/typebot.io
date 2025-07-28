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
