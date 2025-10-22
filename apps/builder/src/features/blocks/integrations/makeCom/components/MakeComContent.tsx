import { Text } from "@chakra-ui/react";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  block: MakeComBlock;
};

export const MakeComContent = ({ block }: Props) => {
  const { typebot } = useTypebot();

  if (!block.options?.webhook?.url)
    return <Text color="gray.500">Configure...</Text>;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Text noOfLines={1} pr="6">
        Trigger scenario
      </Text>
      {block.options?.responseVariableMapping
        ?.filter((mapping) => mapping.variableId)
        .map((mapping) => (
          <SetVariableLabel
            key={mapping.variableId}
            variableId={mapping.variableId as string}
            variables={typebot?.variables}
          />
        ))}
    </div>
  );
};
