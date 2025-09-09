import { Stack, Text } from "@chakra-ui/react";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: TextInputBlock["options"];
};

export const TextInputNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot();
  const attachmentVariableId =
    typebot &&
    options?.attachments?.isEnabled &&
    options?.attachments.saveVariableId;
  const audioClipVariableId =
    typebot &&
    options?.audioClip?.isEnabled &&
    options?.audioClip.saveVariableId;
  return (
    <Stack>
      <Text
        color={"gray.500"}
        h={options?.isLong ? "100px" : undefined}
        overflowY="hidden"
      >
        {options?.labels?.placeholder ??
          defaultTextInputOptions.labels.placeholder}
      </Text>
      {options?.variableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={options.variableId}
        />
      )}
      {attachmentVariableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={attachmentVariableId}
        />
      )}
      {audioClipVariableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={audioClipVariableId}
        />
      )}
    </Stack>
  );
};
