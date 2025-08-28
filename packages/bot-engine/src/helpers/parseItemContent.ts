import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";

export const parseItemContent = (
  item: ChoiceInputBlock["items"][number] | PictureChoiceBlock["items"][number],
) => {
  // Buttons
  if ("content" in item) return item.content;
  // Picture choice
  if ("title" in item) return item.title || item.pictureSrc;
};
