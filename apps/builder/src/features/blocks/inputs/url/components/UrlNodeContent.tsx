import { defaultUrlInputOptions } from "@typebot.io/blocks-inputs/url/constants";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  options: UrlInputBlock["options"];
};

export const UrlNodeContent = ({ options }: Props) => {
  return options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <p className="w-[90%]" color={"gray.500"}>
      {options?.labels?.placeholder ??
        defaultUrlInputOptions.labels.placeholder}
    </p>
  );
};
