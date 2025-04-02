import { SetVariableLabel } from "@/components/SetVariableLabel";
import { ConditionContent } from "@/features/blocks/logic/condition/components/ConditionContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { EventIcon } from "@/features/events/components/EventIcon";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";

type Props = {
  options: ReplyEvent["options"];
};

export const ReplyEventNode = ({ options }: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();

  return (
    <HStack flex="1" align="flex-start" spacing={3} fontWeight="normal">
      <EventIcon mt="0.25rem" type={EventType.REPLY} />
      <Stack>
        {options?.exitCondition?.isEnabled ? (
          <ConditionContent
            condition={options?.exitCondition?.condition}
            variables={typebot?.variables ?? []}
          />
        ) : (
          <Text color="gray.500" fontWeight="normal">
            {t("nodes.events.reply.placeholder")}
          </Text>
        )}
        {options?.variableId && (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.variableId}
          />
        )}
      </Stack>
    </HStack>
  );
};
