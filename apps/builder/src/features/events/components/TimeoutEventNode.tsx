import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { EventIcon } from "@/features/events/components/EventIcon";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { TimeoutEvent } from "@typebot.io/events/schemas";

type Props = {
  options: TimeoutEvent["options"];
};

export const TimeoutEventNode = ({ options }: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();

  return (
    <HStack flex="1" align="flex-start" spacing={3} fontWeight="normal">
      <EventIcon type={EventType.TIMEOUT} mt="5px" />
      <Stack>
        <Text>{t("blocks.events.timeout.node.prefix")}</Text>
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
