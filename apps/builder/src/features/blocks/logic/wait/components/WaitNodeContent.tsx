import { Text } from "@chakra-ui/react";
import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";
import React from "react";

type Props = {
  options: WaitBlock["options"];
};

export const WaitNodeContent = ({
  options: { secondsToWaitFor } = {},
}: Props) => (
  <Text color={secondsToWaitFor ? "currentcolor" : "gray.500"} noOfLines={1}>
    {secondsToWaitFor ? `Wait for ${secondsToWaitFor}s` : "Configure..."}
  </Text>
);
