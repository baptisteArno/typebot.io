import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Stack, Text } from "@chakra-ui/react";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import React from "react";

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
  if (options?.variableId)
    return (
      <Stack w="calc(100% - 25px)">
        <WithVariableContent
          variableId={options?.variableId}
          h={options.isLong ? "100px" : "auto"}
        />
        {attachmentVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={attachmentVariableId}
          />
        )}
        {audioClipVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={audioClipVariableId}
          />
        )}
      </Stack>
    );
  return (
    <Stack>
      <Text color={"gray.500"} h={options?.isLong ? "100px" : "auto"}>
        {options?.labels?.placeholder ??
          defaultTextInputOptions.labels.placeholder}
      </Text>
      {attachmentVariableId && (
        <SetVariableLabel
          variables={typebot.variables}
          variableId={attachmentVariableId}
        />
      )}
      {audioClipVariableId && (
        <SetVariableLabel
          variables={typebot.variables}
          variableId={audioClipVariableId}
        />
      )}
    </Stack>
  );
};
