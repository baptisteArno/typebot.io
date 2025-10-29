import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: EmailInputBlock["options"];
};

export const EmailInputNodeContent = ({
  options: { variableId, labels } = {},
}: Props) => {
  const { typebot } = useTypebot();

  return (
    <div className="flex flex-col gap-2">
      <p color={"gray.500"}>
        {labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder}
      </p>
      {variableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={variableId}
        />
      )}
    </div>
  );
};
