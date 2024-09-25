import { validateEmail } from "@/features/blocks/inputs/email";
import { validatePhoneNumber } from "@/features/blocks/inputs/phone";
import { validateUrl } from "@/features/blocks/inputs/url";
import { parseVariables } from "@/features/variables";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";
import type { Edge } from "../../../../typebot/src/schemas/edge";

export const isInputValid = (
  inputValue: string,
  type: InputBlockType,
): boolean => {
  switch (type) {
    case InputBlockType.EMAIL:
      return validateEmail(inputValue);
    case InputBlockType.PHONE:
      return validatePhoneNumber(inputValue);
    case InputBlockType.URL:
      return validateUrl(inputValue);
  }
  return true;
};

export const blockCanBeRetried = (
  block: Block,
): block is EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock =>
  isInputBlock(block) &&
  isDefined(block.options) &&
  "retryMessageContent" in block.options;

export const parseRetryBlock = (
  block: EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock,
  groupId: string,
  variables: Variable[],
  createEdge: (edge: Edge) => void,
): BubbleBlock => {
  const content = parseVariables(variables)(block.options?.retryMessageContent);
  const newBlockId = block.id + Math.random() * 1000;
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { blockId: newBlockId },
    to: { groupId, blockId: block.id },
  };
  createEdge(newEdge);
  return {
    id: newBlockId,
    type: BubbleBlockType.TEXT,
    content: {
      html: `<div>${content}</div>`,
      richText: [],
      plainText: content,
    },
    outgoingEdgeId: newEdge.id,
  };
};
