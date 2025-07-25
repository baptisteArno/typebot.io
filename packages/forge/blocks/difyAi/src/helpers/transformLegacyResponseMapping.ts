import { chatCompletionResponseValues } from "@typebot.io/ai/constants";

const LEGACY_TO_NEW_MAPPING = {
  Answer: "Message content",
  "Total Tokens": "Total tokens",
  "Conversation ID": "Conversation ID",
} as const;

export const transformLegacyResponseMapping = (
  responseMapping: Array<{ item?: string; variableId?: string }> | undefined,
):
  | Array<{
      item?: (typeof chatCompletionResponseValues)[number] | "Conversation ID";
      variableId?: string;
    }>
  | undefined => {
  if (!responseMapping) return undefined;

  return responseMapping
    .map((mapping) => ({
      ...mapping,
      item: (mapping.item
        ? LEGACY_TO_NEW_MAPPING[
            mapping.item as keyof typeof LEGACY_TO_NEW_MAPPING
          ] || mapping.item
        : undefined) as (typeof chatCompletionResponseValues)[number],
    }))
    .filter(
      (mapping) =>
        !mapping.item ||
        [...chatCompletionResponseValues, "Conversation ID"].includes(
          mapping.item,
        ),
    );
};
