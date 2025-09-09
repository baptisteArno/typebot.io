import { Stack, Text } from "@chakra-ui/react";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: EmailInputBlock["options"];
};

export const EmailInputNodeContent = ({
  options: { variableId, labels } = {},
}: Props) => {
  const { typebot } = useTypebot();

  return (
    <Stack>
      <Text color={"gray.500"}>
        {labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder}
      </Text>
      {variableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={variableId}
        />
      )}
    </Stack>
  );
};
