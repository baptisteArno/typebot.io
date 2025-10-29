import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: TextInputBlock["options"];
};

export const TextInputNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot();
  const attachmentVariableId =
    typebot &&
    options?.attachments?.isEnabled &&
    options?.attachments.saveVariableId;
  const audioClipVariableId =
    typebot &&
    options?.audioClip?.isEnabled &&
    options?.audioClip.saveVariableId;
  return (
    <div className="flex flex-col gap-2">
      <p
        className={cx(
          "overflow-y-hidden text-gray-9",
          options?.isLong ? "h-[100px]" : undefined,
        )}
      >
        {options?.labels?.placeholder ??
          defaultTextInputOptions.labels.placeholder}
      </p>
      {options?.variableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={options.variableId}
        />
      )}
      {attachmentVariableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={attachmentVariableId}
        />
      )}
      {audioClipVariableId && (
        <SetVariableLabel
          variables={typebot?.variables}
          variableId={audioClipVariableId}
        />
      )}
    </div>
  );
};
