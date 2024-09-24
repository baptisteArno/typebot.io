import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Text } from "@chakra-ui/react";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";

type Props = {
  block: HttpRequestBlock;
};

export const WebhookContent = ({ block: { options } }: Props) => {
  const { typebot } = useTypebot();
  const webhook = options?.webhook;

  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>;
  return (
    <Stack w="full">
      <Text noOfLines={2} pr="6">
        {webhook.method} {webhook.url}
      </Text>
      {options?.responseVariableMapping
        ?.filter((mapping) => mapping.variableId)
        .map((mapping) => (
          <SetVariableLabel
            key={mapping.variableId}
            variableId={mapping.variableId as string}
            variables={typebot?.variables}
          />
        ))}
    </Stack>
  );
};
