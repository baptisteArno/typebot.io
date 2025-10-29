import { defaultPhoneInputOptions } from "@typebot.io/blocks-inputs/phone/constants";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  options: PhoneNumberInputBlock["options"];
};

export const PhoneNodeContent = ({
  options: { variableId, labels } = {},
}: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <p color={"gray.500"}>
      {labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
    </p>
  );
