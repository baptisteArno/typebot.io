import { useTranslate } from "@tolgee/react";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  options: FileInputBlock["options"];
};

export const FileInputContent = ({ options }: Props) => {
  const { t } = useTranslate();

  return options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <p className="pr-6 truncate">
      {options?.isMultipleAllowed
        ? t("blocks.inputs.file.collectMultiple.label")
        : t("blocks.inputs.file.collectSingle.label")}
    </p>
  );
};
