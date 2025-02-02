import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack } from "@chakra-ui/react";
import type { OtpInputBlock } from "@typebot.io/blocks-inputs/otp/schema";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import React from "react";

type Props = {
  options: OtpInputBlock["options"];
};

export const OtpInputNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot();
  return (
    <Stack>
      {options?.variableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={options.variableId}
        />
      )}
    </Stack>
  );
};
