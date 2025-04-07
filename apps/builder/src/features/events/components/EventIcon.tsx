import { CommandIcon, FlagIcon } from "@/components/icons";
import { type IconProps, useColorModeValue } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import React from "react";

type Props = { type: TEvent["type"] } & IconProps;

export const EventIcon = ({ type, ...props }: Props): JSX.Element => {
  const gray = useColorModeValue("gray.900", "gray.200");

  switch (type) {
    case EventType.START:
      return <FlagIcon color={gray} {...props} />;
    case EventType.COMMAND:
      return <CommandIcon color={gray} {...props} />;
  }
};
