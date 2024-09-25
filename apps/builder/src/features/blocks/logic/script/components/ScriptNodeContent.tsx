import { Text } from "@chakra-ui/react";
import { defaultScriptOptions } from "@typebot.io/blocks-logic/script/constants";
import type { ScriptBlock } from "@typebot.io/blocks-logic/script/schema";
import React from "react";

type Props = {
  options: ScriptBlock["options"];
};

export const ScriptNodeContent = ({
  options: { name, content } = {},
}: Props) => (
  <Text color={content ? "currentcolor" : "gray.500"} noOfLines={1}>
    {content ? `Run ${name ?? defaultScriptOptions.name}` : "Configure..."}
  </Text>
);
