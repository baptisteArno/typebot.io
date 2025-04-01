import { EventIcon } from "@/features/events/components/EventIcon";
import { HStack, Tag, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { OnMessageEvent } from "@typebot.io/events/schemas";

type Props = {
  options: OnMessageEvent["options"];
};

export const OnMessageEventNode = ({ options }: Props) => {
  const { t } = useTranslate();

  return (
    <HStack spacing={3} fontWeight="normal">
      <EventIcon type={EventType.ON_MESSAGE} />
      {options?.message ? (
        <Tag p="2">{options?.message}</Tag>
      ) : (
        <Text color="gray.500" fontWeight="normal">
          {t("nodes.events.onMessage.placeholder")}
        </Text>
      )}
    </HStack>
  );
};
