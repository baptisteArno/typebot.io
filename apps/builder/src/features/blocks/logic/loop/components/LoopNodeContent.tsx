import { Text } from "@chakra-ui/react";
import { defaultLoopOptions } from "@typebot.io/blocks-logic/loop/constants";
import type { LoopBlock } from "@typebot.io/blocks-logic/loop/schema";
import React from "react";

type Props = {
  options?: LoopBlock["options"];
};

export const LoopNodeContent = ({ options }: Props) => {
  const iterations = options?.iterations ?? defaultLoopOptions.iterations;

  return (
    <Text color={iterations ? "currentcolor" : "gray.500"} noOfLines={1}>
      {iterations ? `Repeat ${iterations} times` : "Configure..."}
    </Text>
  );
};
