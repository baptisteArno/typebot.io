import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { Descendant, TText } from "platejs";
import { convertMarkdownToRichText } from "./convertMarkdownToRichText";
import { isTextDescendant } from "./helpers/isTextDescendant";

export const parseVariablesInRichText = (
  elements: Descendant[],
  {
    variables,
    sessionStore,
    takeLatestIfList,
  }: {
    variables: Variable[];
    sessionStore: SessionStore;
    takeLatestIfList?: boolean;
  },
): { parsedElements: Descendant[]; parsedVariableIds: string[] } => {
  const parsedElements: Descendant[] = [];
  const parsedVariableIds: string[] = [];
  for (const element of elements) {
    if (isTextDescendant(element)) {
      if (isEmpty(element.text)) {
        parsedElements.push(element);
        continue;
      }
      const variablesInText = getVariablesToParseInfoInText(element.text, {
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
        const textBeforeVariable = element.text.substring(
          lastTextEndIndex,
          variableInText.startIndex,
        );
        const textAfterVariable =
          index === variablesInText.length - 1
            ? element.text.substring(variableInText.endIndex)
            : undefined;
        lastTextEndIndex = variableInText.endIndex;
        const isStandaloneElement =
          isEmpty(textBeforeVariable) &&
          isEmpty(textAfterVariable) &&
          variablesInText.length === 1;
        const variableElements = applyElementStyleToDescendants(
          convertMarkdownToRichText(variableInText.value),
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
          parsedElements.push(...variableElements);
          continue;
        }
        const children: TText[] = [];
        if (isNotEmpty(textBeforeVariable))
          children.push({
            ...element,
            text: textBeforeVariable,
          });
        children.push(
          ...variableElements.flatMap((element) => {
            if (isTextDescendant(element)) return element;
            if (
              element.type === "p" &&
              element.children.length === 1 &&
              element.children[0].text === ""
            ) {
              return {
                text: "\n\n",
              };
            }
            return flattenDescendants(element.children);
          }),
        );
        if (isNotEmpty(textAfterVariable))
          children.push({
            ...element,
            text: textAfterVariable,
          });
        parsedElements.push(...children);
      }

      continue;
    }

    const {
      parsedElements: parsedChildren,
      parsedVariableIds: parsedChildrenVariableIds,
    } = parseVariablesInRichText(element.children, {
      variables,
      sessionStore,
      takeLatestIfList,
    });

    parsedVariableIds.push(...parsedChildrenVariableIds);
    const isStandaloneVariable =
      element.children.length === 1 &&
      element.children[0] &&
      "text" in element.children[0] &&
      isSingleVariable(element.children[0].text as string) &&
      element.type !== "a";

    // Bypass the current element
    if (isStandaloneVariable) {
      parsedElements.push(...parsedChildren);
    } else {
      parsedElements.push({
        ...element,
        url: element.url
          ? parseVariables(element.url as string, {
              variables,
              sessionStore,
            })
          : undefined,
        type: element.type,
        children: parsedChildren,
      });
    }
  }
  return {
    parsedElements,
    parsedVariableIds,
  };
};

const applyElementStyleToDescendants = (
  variableElements: Descendant[],
  styles: { bold: unknown; italic: unknown; underline: unknown },
): Descendant[] =>
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

const flattenDescendants = (descendants: Descendant[]): TText[] =>
  descendants.flatMap((descendant) => {
    if (isTextDescendant(descendant)) return descendant;
    return flattenDescendants(descendant.children);
  });
