import { type IconProps, useColorModeValue } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import {
  CircleXIcon,
  CommandIcon,
  FlagIcon,
  SendIcon,
} from "@/components/icons";

type Props = { type: TEvent["type"] } & IconProps;

export const EventIcon = ({ type, ...props }: Props): JSX.Element => {
  const gray = useColorModeValue("gray.900", "gray.200");

  switch (type) {
    case EventType.START:
      return <FlagIcon color={gray} {...props} />;
    case EventType.COMMAND:
      return <CommandIcon color={gray} {...props} />;
    case EventType.REPLY:
      return <SendIcon color={gray} {...props} />;
    case EventType.INVALID_REPLY:
      return <CircleXIcon color={gray} {...props} />;
  }
};
