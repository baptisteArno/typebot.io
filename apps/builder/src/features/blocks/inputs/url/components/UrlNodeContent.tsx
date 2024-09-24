import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { defaultUrlInputOptions } from "@typebot.io/blocks-inputs/url/constants";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import React from "react";

type Props = {
  options: UrlInputBlock["options"];
};

export const UrlNodeContent = ({ options }: Props) => {
  return options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <Text color={"gray.500"} w="90%">
      {options?.labels?.placeholder ??
        defaultUrlInputOptions.labels.placeholder}
    </Text>
  );
};
