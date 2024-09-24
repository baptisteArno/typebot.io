import { NumberInput } from "@/components/inputs";
import { Stack } from "@chakra-ui/react";
import { defaultAbTestOptions } from "@typebot.io/blocks-logic/abTest/constants";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import { isDefined } from "@typebot.io/lib/utils";
import React from "react";

type Props = {
  options: AbTestBlock["options"];
  onOptionsChange: (options: AbTestBlock["options"]) => void;
};

export const AbTestSettings = ({ options, onOptionsChange }: Props) => {
  const updateAPercent = (aPercent?: number) =>
    isDefined(aPercent) ? onOptionsChange({ ...options, aPercent }) : null;

  return (
    <Stack spacing={4}>
      <NumberInput
        defaultValue={options?.aPercent ?? defaultAbTestOptions.aPercent}
        onValueChange={updateAPercent}
        withVariableButton={false}
        label="Percent of users to follow A:"
        direction="column"
        max={100}
        min={0}
      />
    </Stack>
  );
};
