import { Text } from "@chakra-ui/react";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";

type Props = {
  block: MakeComBlock;
};

export const MakeComContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <Text color="gray.500">Configure...</Text>;
  return (
    <Text noOfLines={1} pr="6">
      Trigger scenario
    </Text>
  );
};
