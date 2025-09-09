import { HStack } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import { EventIcon } from "@/features/events/components/EventIcon";
import { EventLabel } from "@/features/events/components/EventLabel";

export const StartEventNode = () => (
  <HStack spacing={3}>
    <EventIcon type={EventType.START} />
    <EventLabel type={EventType.START} />
  </HStack>
);
