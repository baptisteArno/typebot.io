import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Text, type TextProps } from "@chakra-ui/react";
import { byId } from "@typebot.io/lib/utils";
import React from "react";
import { VariableTag } from "./VariableTag";

type Props = {
  variableId: string;
} & TextProps;

export const WithVariableContent = ({ variableId, ...props }: Props) => {
  const { typebot } = useTypebot();
  const variableName = typebot?.variables.find(byId(variableId))?.name;

  return (
    <Text w="calc(100% - 25px)" {...props}>
      Collect <VariableTag variableName={variableName ?? ""} />
    </Text>
  );
};
