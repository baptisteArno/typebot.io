import { chakra } from "@chakra-ui/react";

type Props = {
  variableName: string;
};

export const VariableTag = ({ variableName }: Props) => (
  <chakra.span
    bgColor="purple.600"
    color="white"
    rounded="md"
    py="0.5"
    px="1"
    wordBreak="break-all"
  >
    {variableName}
  </chakra.span>
);
