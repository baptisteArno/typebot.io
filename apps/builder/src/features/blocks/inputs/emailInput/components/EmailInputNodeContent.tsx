import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import React from "react";

type Props = {
  options: EmailInputBlock["options"];
};

export const EmailInputNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={"gray.500"}>
      {labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder}
    </Text>
  );
