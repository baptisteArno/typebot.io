import { HStack, type StackProps, useColorModeValue } from "@chakra-ui/react";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import { EventIcon } from "./EventIcon";
import { EventLabel } from "./EventLabel";

export const EventCardOverlay = ({
  type,
  ...props
}: StackProps & { type: TDraggableEvent["type"] }) => {
  return (
    <HStack
      borderWidth="1px"
      rounded="lg"
      cursor={"grabbing"}
      w="147px"
      transition="none"
      pointerEvents="none"
      px="4"
      py="2"
      borderColor={useColorModeValue("gray.200", "gray.900")}
      bgColor={useColorModeValue("gray.50", "gray.900")}
      shadow="xl"
      zIndex={2}
      {...props}
    >
      <EventIcon type={type} />
      <EventLabel type={type} />
    </HStack>
  );
};
