import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";

type Props = {
  options: FileInputBlock["options"];
};

export const FileInputContent = ({ options }: Props) => {
  const { t } = useTranslate();

  return options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <Text noOfLines={1} pr="6">
      {options?.isMultipleAllowed
        ? t("blocks.inputs.file.collectMultiple.label")
        : t("blocks.inputs.file.collectSingle.label")}
    </Text>
  );
};
