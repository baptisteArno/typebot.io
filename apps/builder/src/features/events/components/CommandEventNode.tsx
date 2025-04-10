import { EventIcon } from "@/features/events/components/EventIcon";
import { HStack, Tag, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";

type Props = {
  options: CommandEvent["options"];
};

export const CommandEventNode = ({ options }: Props) => {
  const { t } = useTranslate();

  return (
    <HStack spacing={3} fontWeight="normal">
      <EventIcon type={EventType.COMMAND} />
      {options?.command ? (
        <Tag p="2">{options?.command}</Tag>
      ) : (
        <Text color="gray.500" fontWeight="normal">
          {t("configure")}
        </Text>
      )}
    </HStack>
  );
};
