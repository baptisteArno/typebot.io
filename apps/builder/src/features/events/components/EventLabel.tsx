import { Text, type TextProps } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import React from "react";

type Props = { type: TEvent["type"] } & TextProps;

export const EventLabel = ({ type, ...props }: Props): JSX.Element => {
  const label = getEventBlockLabel()[type];

  return (
    <Text fontSize="sm" {...props}>
      {label}
    </Text>
  );
};

export const getEventBlockLabel = (): { [key in EventType]: string } => ({
  [EventType.START]: "Start",
  [EventType.COMMAND]: "Command",
});
