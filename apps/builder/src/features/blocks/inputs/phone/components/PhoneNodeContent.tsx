import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { defaultPhoneInputOptions } from "@typebot.io/blocks-inputs/phone/constants";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import React from "react";

type Props = {
  options: PhoneNumberInputBlock["options"];
};

export const PhoneNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={"gray.500"}>
      {labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
    </Text>
  );
