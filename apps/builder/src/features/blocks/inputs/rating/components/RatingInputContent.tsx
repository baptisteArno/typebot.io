import { useTranslate } from "@tolgee/react";
import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";
import { WithVariableContent } from "@/features/graph/components/nodes/block/WithVariableContent";

type Props = {
  variableId?: string;
  block: RatingInputBlock;
};

export const RatingInputContent = ({ variableId, block }: Props) => {
  const { t } = useTranslate();

  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <p className="pr-6 truncate">
      {t("blocks.inputs.rating.from.label")}{" "}
      {block.options?.buttonType === "Icons"
        ? 1
        : (block.options?.startsAt ?? defaultRatingInputOptions.startsAt)}{" "}
      {t("blocks.inputs.rating.to.label")}{" "}
      {block.options?.length ?? defaultRatingInputOptions.length}
    </p>
  );
};
