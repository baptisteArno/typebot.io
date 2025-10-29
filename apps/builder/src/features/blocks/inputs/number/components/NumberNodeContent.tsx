import { defaultNumberInputPlaceholder } from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  options: NumberInputBlock["options"];
};

export const NumberNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <p color={"gray.500"}>
      {labels?.placeholder ?? defaultNumberInputPlaceholder}
    </p>
  );
