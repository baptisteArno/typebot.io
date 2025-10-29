import { defaultAbTestOptions } from "@typebot.io/blocks-logic/abTest/constants";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";

type Props = {
  options: AbTestBlock["options"];
  onOptionsChange: (options: AbTestBlock["options"]) => void;
};

export const AbTestSettings = ({ options, onOptionsChange }: Props) => {
  const updateAPercent = (aPercent?: number) =>
    isDefined(aPercent) ? onOptionsChange({ ...options, aPercent }) : null;

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Percent of users to follow A:</Field.Label>
        <BasicNumberInput
          defaultValue={options?.aPercent ?? defaultAbTestOptions.aPercent}
          onValueChange={updateAPercent}
          withVariableButton={false}
          max={100}
          min={0}
        />
      </Field.Root>
    </div>
  );
};
