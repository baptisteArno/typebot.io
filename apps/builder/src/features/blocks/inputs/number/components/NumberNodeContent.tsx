import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { defaultNumberInputOptions } from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import React from "react";

type Props = {
  options: NumberInputBlock["options"];
};

export const NumberNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={"gray.500"}>
      {labels?.placeholder ?? defaultNumberInputOptions.labels.placeholder}
    </Text>
  );
