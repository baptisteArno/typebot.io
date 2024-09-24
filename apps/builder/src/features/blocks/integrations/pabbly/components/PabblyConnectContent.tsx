import { Text } from "@chakra-ui/react";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";

type Props = {
  block: PabblyConnectBlock;
};

export const PabblyConnectContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <Text color="gray.500">Configure...</Text>;
  return (
    <Text noOfLines={1} pr="6">
      Trigger scenario
    </Text>
  );
};
