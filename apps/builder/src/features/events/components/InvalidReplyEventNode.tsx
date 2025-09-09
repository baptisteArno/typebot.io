import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { InvalidReplyEvent } from "@typebot.io/events/schemas";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { EventIcon } from "@/features/events/components/EventIcon";

type Props = {
  options: InvalidReplyEvent["options"];
};

export const InvalidReplyEventNode = ({ options }: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();

  return (
    <HStack flex="1" align="flex-start" spacing={3} fontWeight="normal">
      <EventIcon type={EventType.INVALID_REPLY} mt="5px" />
      <Stack>
        <Text>{t("blocks.events.invalidReply.node.prefix")}</Text>
        {options?.contentVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.contentVariableId}
          />
        ) : null}
        {options?.inputTypeVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.inputTypeVariableId}
          />
        ) : null}
        {options?.inputNameVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.inputNameVariableId}
          />
        ) : null}
      </Stack>
    </HStack>
  );
};
