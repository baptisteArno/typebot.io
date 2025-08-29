import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { parseItemContent } from "../../../helpers/parseItemContent";
import type { ParsedReply } from "../../../types";

export const parseSingleChoiceReply = (
  inputValue: string,
  {
    items,
    replyId,
  }: {
    items: ChoiceInputBlock["items"] | PictureChoiceBlock["items"];
    replyId: string | undefined;
  },
): ParsedReply => {
  const matchedItem = [...items]
    .sort((a, b) => {
      const aContent = parseItemContent(a);
      const bContent = parseItemContent(b);
      return (bContent?.length ?? 0) - (aContent?.length ?? 0);
    })
    .find((item) => {
      if (replyId && item.id === replyId) return true;
      if (item.id === inputValue) return true;
      if (item.value && inputValue.trim() === item.value.trim()) return true;
      const itemContent = parseItemContent(item);
      if (itemContent && inputValue.trim() === itemContent.trim()) return true;
      return false;
    });

  if (!matchedItem) return { status: "fail" };

  const content = matchedItem.value || parseItemContent(matchedItem);
  if (!content) return { status: "fail" };

  return {
    status: "success",
    content,
    outgoingEdgeId: matchedItem.outgoingEdgeId,
  };
};
