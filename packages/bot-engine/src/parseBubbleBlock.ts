import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import { parseVideoUrl } from "@typebot.io/blocks-bubbles/video/helpers";
import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import { convertMarkdownToRichText } from "@typebot.io/rich-text/convertMarkdownToRichText";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import type { TDescendant, TElement } from "@typebot.io/rich-text/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
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

      const richText = parseVariablesInRichText(block.content?.richText ?? [], {
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
                markdown: convertRichTextToMarkdown(richText as TElement[]),
              },
      };
    }

    case BubbleBlockType.EMBED: {
      return deepParseVariables(block, {
        variables,
        sessionStore,
      });
    }
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

export const parseVariablesInRichText = (
  elements: TDescendant[],
  {
    variables,
    sessionStore,
    takeLatestIfList,
  }: {
    variables: Variable[];
    sessionStore: SessionStore;
    takeLatestIfList?: boolean;
  },
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
        sessionStore,
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
      sessionStore,
      takeLatestIfList,
    });

    parsedVariableIds.push(...parsedChildrenVariableIds);
    parsedElements.push({
      ...element,
      url: element.url
        ? parseVariables(element.url as string, {
            variables,
            sessionStore,
          })
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
