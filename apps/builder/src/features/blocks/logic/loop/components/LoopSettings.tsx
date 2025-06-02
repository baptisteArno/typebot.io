import { TextInput } from "@/components/inputs";
import { Stack } from "@chakra-ui/react";
import { defaultLoopOptions } from "@typebot.io/blocks-logic/loop/constants";
import type { LoopBlock } from "@typebot.io/blocks-logic/loop/schema";
import React from "react";

type Props = {
  options: LoopBlock["options"];
  onOptionsChange: (options: LoopBlock["options"]) => void;
};

export const LoopSettings = ({ options, onOptionsChange }: Props) => {
  const handleIterationsChange = (iterationsStr: string) => {
    const iterations = Number.parseInt(iterationsStr);
    if (isNaN(iterations)) return;
    onOptionsChange({ ...options, iterations });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label="Iterations:"
        type="number"
        defaultValue={(
          options?.iterations ?? defaultLoopOptions.iterations
        ).toString()}
        onChange={handleIterationsChange}
        withVariableButton={false}
        placeholder="Number of times to repeat (max 100)"
      />
    </Stack>
  );
};
