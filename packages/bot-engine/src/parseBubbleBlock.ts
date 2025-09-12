import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import { parseVideoUrl } from "@typebot.io/blocks-bubbles/video/helpers";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { parseVariablesInRichText } from "@typebot.io/rich-text/parseVariablesInRichText";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

type Params = {
  version: 1 | 2;
  typebotVersion: Typebot["version"];
  variables: Variable[];
  textBubbleContentFormat: "richText" | "markdown";
  sessionStore: SessionStore;
};

export type BubbleBlockWithDefinedContent = BubbleBlock & {
  content: NonNullable<BubbleBlock["content"]>;
};

export const parseBubbleBlock = (
  block: BubbleBlockWithDefinedContent,
  {
    version,
    variables,
    typebotVersion,
    textBubbleContentFormat,
    sessionStore,
  }: Params,
): ContinueChatResponse["messages"][0] => {
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      if (version === 1)
        return {
          ...block,
          content: {
            type: "richText",
            richText: (block.content?.richText ?? []).map((element) =>
              deepParseVariables(element, {
                variables,
                sessionStore,
              }),
            ),
          },
        };
      if (!block.content.richText) {
        return {
          ...block,
          content: {
            type: "richText",
            richText: [],
          },
        };
      }

      const richText = parseVariablesInRichText(block.content.richText, {
        variables,
        sessionStore,
        takeLatestIfList: !isTypebotVersionAtLeastV6(typebotVersion),
      }).parsedElements;

      return {
        ...block,
        content:
          textBubbleContentFormat === "richText"
            ? {
                type: "richText",
                richText,
              }
            : {
                type: "markdown",
                markdown: convertRichTextToMarkdown(richText),
              },
      };
    }

    case BubbleBlockType.EMBED:
      return deepParseVariables(block, {
        variables,
        sessionStore,
      });
    case BubbleBlockType.VIDEO: {
      const parsedContent = block.content
        ? deepParseVariables(block.content, {
            variables,
            sessionStore,
          })
        : undefined;

      return {
        ...block,
        content: {
          ...parsedContent,
          ...(parsedContent?.url ? parseVideoUrl(parsedContent.url) : {}),
        },
      };
    }
    default:
      return deepParseVariables(block, {
        variables,
        sessionStore,
      });
  }
};
