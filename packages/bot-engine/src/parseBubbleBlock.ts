import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import { defaultVideoBubbleContent } from "@typebot.io/blocks-bubbles/video/constants";
import { parseVideoUrl } from "@typebot.io/blocks-bubbles/video/helpers";
import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import { convertMarkdownToRichText } from "@typebot.io/rich-text/convertMarkdownToRichText";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import type { TDescendant, TElement } from "@typebot.io/rich-text/types";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { ContinueChatResponse } from "./schemas/api";

type Params = {
  version: 1 | 2;
  typebotVersion: Typebot["version"];
  variables: Variable[];
  textBubbleContentFormat: "richText" | "markdown";
};

export type BubbleBlockWithDefinedContent = BubbleBlock & {
  content: NonNullable<BubbleBlock["content"]>;
};

export const parseBubbleBlock = (
  block: BubbleBlockWithDefinedContent,
  { version, variables, typebotVersion, textBubbleContentFormat }: Params,
): ContinueChatResponse["messages"][0] => {
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      if (version === 1)
        return {
          ...block,
          content: {
            type: "richText",
            richText: (block.content?.richText ?? []).map(
              deepParseVariables(variables),
            ),
          },
        };

      const richText = parseVariablesInRichText(block.content?.richText ?? [], {
        variables,
        takeLatestIfList: typebotVersion !== "6",
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
                markdown: convertRichTextToMarkdown(richText as TElement[]),
              },
      };
    }

    case BubbleBlockType.EMBED: {
      const message = deepParseVariables(variables)(block);
      return {
        ...message,
        content: {
          ...message.content,
          height:
            typeof message.content?.height === "string"
              ? Number.parseFloat(message.content.height)
              : message.content?.height,
        },
      };
    }
    case BubbleBlockType.VIDEO: {
      const parsedContent = block.content
        ? deepParseVariables(variables)(block.content)
        : undefined;

      return {
        ...block,
        content: {
          ...parsedContent,
          ...(parsedContent?.url ? parseVideoUrl(parsedContent.url) : {}),
          height:
            typeof parsedContent?.height === "string"
              ? Number.parseFloat(parsedContent.height)
              : defaultVideoBubbleContent.height,
        },
      };
    }
    default:
      return deepParseVariables(variables)(block);
  }
};

export const parseVariablesInRichText = (
  elements: TDescendant[],
  {
    variables,
    takeLatestIfList,
  }: { variables: Variable[]; takeLatestIfList?: boolean },
): { parsedElements: TDescendant[]; parsedVariableIds: string[] } => {
  const parsedElements: TDescendant[] = [];
  const parsedVariableIds: string[] = [];
  for (const element of elements) {
    if ("text" in element) {
      const text = element.text as string;
      if (isEmpty(text)) {
        parsedElements.push(element);
        continue;
      }
      const variablesInText = getVariablesToParseInfoInText(text, {
        variables,
        takeLatestIfList,
      });
      parsedVariableIds.push(
        ...variablesInText.map((v) => v.variableId).filter(isDefined),
      );
      if (variablesInText.length === 0) {
        parsedElements.push(element);
        continue;
      }
      let lastTextEndIndex = 0;
      let index = -1;
      for (const variableInText of variablesInText) {
        index += 1;
        const textBeforeVariable = text.substring(
          lastTextEndIndex,
          variableInText.startIndex,
        );
        const textAfterVariable =
          index === variablesInText.length - 1
            ? text.substring(variableInText.endIndex)
            : undefined;
        lastTextEndIndex = variableInText.endIndex;
        const isStandaloneElement =
          isEmpty(textBeforeVariable) &&
          isEmpty(textAfterVariable) &&
          variablesInText.length === 1;
        const variableElements = convertMarkdownToRichText(
          isStandaloneElement
            ? variableInText.value
            : variableInText.value.replace(/[\n]+/g, " "),
        );

        const variableElementsWithStyling = applyElementStyleToDescendants(
          variableElements,
          {
            bold: element.bold,
            italic: element.italic,
            underline: element.underline,
          },
        );

        if (
          isStandaloneElement &&
          !element.bold &&
          !element.italic &&
          !element.underline
        ) {
          parsedElements.push(...variableElementsWithStyling);
          continue;
        }
        const children: TDescendant[] = [];
        if (isNotEmpty(textBeforeVariable))
          children.push({
            ...element,
            text: textBeforeVariable,
          });
        children.push({
          type: "inline-variable",
          children: variableElementsWithStyling,
        });
        if (isNotEmpty(textAfterVariable))
          children.push({
            ...element,
            text: textAfterVariable,
          });
        parsedElements.push(...children);
      }

      continue;
    }

    const type =
      element.children.length === 1 &&
      element.children[0] &&
      "text" in element.children[0] &&
      isSingleVariable(element.children[0].text as string) &&
      element.type !== "a"
        ? "variable"
        : element.type;

    const {
      parsedElements: parsedChildren,
      parsedVariableIds: parsedChildrenVariableIds,
    } = parseVariablesInRichText(element.children as TDescendant[], {
      variables,
      takeLatestIfList,
    });

    parsedVariableIds.push(...parsedChildrenVariableIds);
    parsedElements.push({
      ...element,
      url: element.url
        ? parseVariables(variables)(element.url as string)
        : undefined,
      type,
      children: parsedChildren,
    });
  }
  return {
    parsedElements,
    parsedVariableIds,
  };
};

const applyElementStyleToDescendants = (
  variableElements: TDescendant[],
  styles: { bold: unknown; italic: unknown; underline: unknown },
): TDescendant[] =>
  variableElements.map((variableElement) => {
    if ("text" in variableElement) return { ...styles, ...variableElement };
    return {
      ...variableElement,
      children: applyElementStyleToDescendants(
        variableElement.children,
        styles,
      ),
    };
  });
