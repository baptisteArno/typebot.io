import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { PlateBlock } from "./plate/PlateBlock";

type Props = {
  block: TextBubbleBlock;
};

export const TextBubbleContent = ({ block }: Props) => {
  const isEmpty = (block.content?.richText?.length ?? 0) === 0;
  return (
    <div
      className={cx(
        "flex w-[90%] flex-col slate-html-container",
        isEmpty ? "opacity-50 text-gray-9" : "opacity-100",
      )}
    >
      {block.content?.richText?.map((element, idx) => (
        <PlateBlock key={idx} element={element} />
      ))}
    </div>
  );
};
