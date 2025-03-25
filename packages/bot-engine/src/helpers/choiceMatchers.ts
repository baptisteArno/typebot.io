import { isNotEmpty } from "@typebot.io/lib/utils";

export type ChoiceItem = {
  id: string;
  outgoingEdgeId?: string;
  [key: string]: any;
};

export type MatchResult = {
  strippedInput: string;
  matchedItemIds: string[];
};

export type MatcherResult<T extends ChoiceItem> = MatchResult & {
  remaining: T[];
};

export type MatchContext<T extends ChoiceItem> = {
  items: T[];
  inputValue: string;
  key: string;
};

export type MatchFunction<T extends ChoiceItem> = (
  item: T,
  input: string,
  idx?: number,
) => boolean;

export const sortByContentLength = <T extends ChoiceItem>(
  items: T[],
  contentKey = "content",
): T[] =>
  [...items].sort(
    (a, b) => (b[contentKey]?.length ?? 0) - (a[contentKey]?.length ?? 0),
  );

export const createMatchReducer =
  <T extends ChoiceItem>(
    matchFn: MatchFunction<T>,
    contentKey = "content",
    valueKey = "value",
  ) =>
  (acc: MatchResult, item: T, idx?: number) => {
    const input = acc.strippedInput;
    if (matchFn(item, input, idx)) {
      const matchValue = item[contentKey] ?? item[valueKey] ?? `${idx! + 1}`;
      return {
        strippedInput: acc.strippedInput.replace(matchValue, ""),
        matchedItemIds: [...acc.matchedItemIds, item.id],
      };
    }
    return acc;
  };

export const matchByKey = <T extends ChoiceItem>({
  items,
  inputValue,
  key = "content",
}: MatchContext<T>): MatcherResult<T> => {
  const matchFn: MatchFunction<T> = (item, input) =>
    Boolean(
      item[key] && input.toLowerCase().includes(item[key].trim().toLowerCase()),
    );

  const matchingItems = items.reduce(createMatchReducer(matchFn, key), {
    strippedInput: inputValue.trim(),
    matchedItemIds: [],
  });

  return {
    ...matchingItems,
    remaining: items.filter(
      (item) => !matchingItems.matchedItemIds.includes(item.id),
    ),
  };
};

export const matchByIndex = <T extends ChoiceItem>(
  items: T[],
  { strippedInput }: MatchResult,
): MatcherResult<T> => {
  const matchFn: MatchFunction<T> = (item, input, idx) =>
    input.includes(`${idx! + 1}`);

  const matchingItems = items.reduce(createMatchReducer(matchFn), {
    strippedInput,
    matchedItemIds: [],
  });

  return {
    ...matchingItems,
    remaining: items.filter(
      (item) => !matchingItems.matchedItemIds.includes(item.id),
    ),
  };
};

export const getItemContent = <T extends ChoiceItem>(
  item: T,
  contentKeys: string[],
): string => {
  for (const contentKey of contentKeys) {
    if (isNotEmpty(item[contentKey])) return item[contentKey];
  }
  return "";
};
