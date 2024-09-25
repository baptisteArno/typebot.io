import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";
import { Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";

type Props = {
  variableId?: string;
  block: RatingInputBlock;
};

export const RatingInputContent = ({ variableId, block }: Props) => {
  const { t } = useTranslate();

  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text noOfLines={1} pr="6">
      {t("blocks.inputs.rating.from.label")}{" "}
      {block.options?.buttonType === "Icons"
        ? 1
        : (block.options?.startsAt ?? defaultRatingInputOptions.startsAt)}{" "}
      {t("blocks.inputs.rating.to.label")}{" "}
      {block.options?.length ?? defaultRatingInputOptions.length}
    </Text>
  );
};
