import { EventIcon } from "@/features/events/components/EventIcon";
import { HStack, Tag } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";

type Props = {
  options: CommandEvent["options"];
};

export const CommandEventNode = ({ options }: Props) => (
  <HStack spacing={3} fontWeight="normal">
    <EventIcon type={EventType.COMMAND} />
    {options?.command ? (
      <Tag p="2">{options?.command}</Tag>
    ) : (
      <Text color="gray.500" fontWeight="normal">
        Configure...
      </Text>
    )}
  </HStack>
);
