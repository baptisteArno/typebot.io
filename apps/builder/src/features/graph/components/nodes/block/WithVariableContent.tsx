import { byId } from "@typebot.io/lib/utils";
import { cn } from "@typebot.io/ui/lib/cn";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "./VariableTag";

type Props = {
  variableId: string;
  className?: string;
};

export const WithVariableContent = ({ variableId, className }: Props) => {
  const { typebot } = useTypebot();
  const variableName = typebot?.variables.find(byId(variableId))?.name;

  return (
    <p className={cn("w-[calc(100% - 25px)]", className)}>
      Collect <VariableTag variableName={variableName ?? ""} />
    </p>
  );
};
